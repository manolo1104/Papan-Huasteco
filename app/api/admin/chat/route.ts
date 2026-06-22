import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireRol } from "@/lib/caja/auth";
import {
  loadDashboard,
  loadMetricasDashboard,
  loadStockBajo,
  type DashboardData,
} from "@/lib/caja/data";
import { todayISO, mesActual } from "@/lib/caja/server";
import { mxn, mxnCorto, fechaCorta, fechaLarga } from "@/lib/caja/format";
import { TURNOS, labelDe } from "@/lib/caja/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Msg = { role: "user" | "assistant"; content: string };

async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) ?? {};
  } catch {
    return {};
  }
}

/** Arma un resumen en texto con TODOS los datos del negocio para el modelo. */
async function construirContexto(): Promise<string> {
  const hoy = todayISO();
  const mes = mesActual();
  const [data, metricas, stockBajo] = await Promise.all([
    loadDashboard(),
    loadMetricasDashboard(),
    loadStockBajo(),
  ]);

  if (!data) {
    return `FECHA DE HOY: ${fechaLarga(hoy)} (${hoy})\n\nLa base de datos todavía no está conectada, así que no hay números disponibles.`;
  }
  const d: DashboardData = data;
  const L: string[] = [];
  L.push(`FECHA DE HOY: ${fechaLarga(hoy)} (${hoy})`);

  L.push(`\n== HOY ==`);
  L.push(`Ingresos: ${mxn(d.hoy.ingresos)} (efectivo ${mxn(d.hoy.efectivo)}, tarjeta ${mxn(d.hoy.tarjeta)}).`);
  L.push(`Gastos: ${mxn(d.hoy.gastos)}. Utilidad: ${mxn(d.hoy.utilidad)}.`);
  L.push(
    d.turnoAbierto
      ? `Hay un turno ABIERTO: ${labelDe([...TURNOS], d.turnoAbierto.turno)} del ${fechaCorta(d.turnoAbierto.fecha)}.`
      : `No hay ningún turno abierto en este momento.`
  );

  L.push(`\n== ESTA SEMANA (últimos 7 días) ==`);
  L.push(`Ingresos ${mxn(d.semana.ingresos)}, gastos ${mxn(d.semana.gastos)}, utilidad ${mxn(d.semana.utilidad)}.`);

  const margenMes = d.mes.ingresos > 0 ? Math.round((d.mes.utilidad / d.mes.ingresos) * 100) : 0;
  L.push(`\n== ESTE MES (${mes}) ==`);
  L.push(`Ingresos ${mxn(d.mes.ingresos)} (efectivo ${mxn(d.mes.efectivo)}, tarjeta ${mxn(d.mes.tarjeta)}, otros ${mxn(d.mes.otros)}).`);
  L.push(`Gastos ${mxn(d.mes.gastos)}. Utilidad ${mxn(d.mes.utilidad)}. Margen ${margenMes}% sobre ventas.`);
  if (d.meta > 0) {
    const pct = Math.round((d.mes.ingresos / d.meta) * 100);
    L.push(`Meta de ventas del mes: ${mxn(d.meta)} (vas en ${pct}%).`);
  } else {
    L.push(`No hay meta de ventas fijada para el mes.`);
  }
  if (d.mejorDia) L.push(`Mejor día del mes: ${fechaCorta(d.mejorDia.fecha)} con ${mxn(d.mejorDia.total)}.`);
  if (d.mejorTurno) L.push(`Mejor turno del mes: ${labelDe([...TURNOS], d.mejorTurno.turno)} con ${mxn(d.mejorTurno.total)}.`);
  L.push(`Faltantes de caja en el mes: ${mxn(d.mes.faltantes)}.`);

  if (d.gastosPorCategoria.length) {
    L.push(`\nGastos del mes por categoría:`);
    for (const g of d.gastosPorCategoria.slice(0, 12)) L.push(`- ${g.categoria}: ${mxn(g.total)}`);
  }

  L.push(`\n== VENTAS POR EL POS (este mes) ==`);
  L.push(`Cuentas cobradas: ${metricas.cuentas}. Ticket promedio: ${metricas.ticketPromedio > 0 ? mxn(metricas.ticketPromedio) : "sin datos"}.`);
  if (metricas.topVendidos.length) {
    L.push(`Platillos más vendidos:`);
    for (const p of metricas.topVendidos) L.push(`- ${p.nombre}: ${p.cantidad} vendidos (${mxn(p.ingresos)})`);
  }

  L.push(`\n== INVENTARIO ==`);
  if (stockBajo.length === 0) {
    L.push(`Todos los insumos están por arriba de su mínimo (sin alertas).`);
  } else {
    L.push(`Insumos en o por debajo de su mínimo (hay que surtir):`);
    for (const i of stockBajo.slice(0, 15)) L.push(`- ${i.nombre}: quedan ${i.stock_actual} ${i.unidad} (mínimo ${i.stock_minimo})`);
  }

  L.push(`\n== EVENTOS CON SALDO PENDIENTE ==`);
  if (d.eventosPendientes.length === 0) {
    L.push(`No hay eventos con saldo pendiente.`);
  } else {
    for (const e of d.eventosPendientes.slice(0, 12))
      L.push(`- ${e.cliente_nombre} (${fechaCorta(e.fecha)}): saldo ${mxn(e.total_acordado - e.pagado)} [${e.estado}]`);
  }

  return L.join("\n");
}

const SYSTEM_BASE = `Eres el asistente de "El Papán Huasteco", un restaurante de cocina huasteca en Xilitla, San Luis Potosí. Ayudas al dueño y a la encargada a entender los números de su negocio.

Tienes acceso EN VIVO a los datos del panel (caja, ventas, gastos, inventario, eventos), que vienen abajo entre las etiquetas <DATOS>.

Reglas:
- Responde SIEMPRE en español, claro y corto, como si le hablaras a una persona sin estudios de finanzas. Evita tecnicismos.
- Usa SOLO los datos de abajo; no inventes cifras. Si te preguntan algo que no aparece en los datos, dilo con honestidad y, si puedes, sugiere en qué pestaña del panel verlo.
- El dinero va en pesos mexicanos (ej. $1,250).
- Puedes hacer cuentas con los datos (sumar, restar, comparar, sacar porcentajes) y dar recomendaciones sencillas.
- Responde directamente con la respuesta final, sin mostrar tu razonamiento paso a paso. Usa viñetas cuando ayuden a leer.`;

export async function POST(req: Request) {
  const auth = await requireRol("operador");
  if (auth instanceof Response) return auth;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      error:
        "Falta configurar el asistente. El dueño debe agregar la llave ANTHROPIC_API_KEY en Vercel (Settings → Environment Variables) y volver a desplegar.",
    });
  }

  const body = await readBody(req);
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: Msg[] = raw
    .map((m): Msg | null => {
      const role = (m as Msg)?.role;
      const content = (m as Msg)?.content;
      if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
      const t = content.trim().slice(0, 4000);
      return t ? { role, content: t } : null;
    })
    .filter((m): m is Msg => m !== null)
    .slice(-20);

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Escribe tu pregunta." }, { status: 400 });
  }

  let contexto: string;
  try {
    contexto = await construirContexto();
  } catch {
    contexto = "No se pudieron leer los datos del negocio en este momento.";
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const msg = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1500,
      system: `${SYSTEM_BASE}\n\n<DATOS>\n${contexto}\n</DATOS>`,
      messages,
    });
    const reply = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return NextResponse.json({ reply: reply || "No tengo una respuesta para eso." });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError)
      return NextResponse.json({ error: "La llave ANTHROPIC_API_KEY no es válida. Revísala en Vercel." });
    if (e instanceof Anthropic.RateLimitError)
      return NextResponse.json({ error: "El asistente está saturado por el momento. Intenta en un minuto." });
    const detail = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ error: `No pude responder ahora (${detail}). Intenta de nuevo.` });
  }
}
