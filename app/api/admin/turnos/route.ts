import { NextResponse } from "next/server";
import { requireRol } from "@/lib/caja/auth";
import { createAdminClient, adminEnvReady } from "@/lib/supabase/admin";
import {
  sanitizeAbrirTurno,
  sanitizeCerrarTurno,
  sanitizeEditarTurno,
  calcularCorte,
  num,
} from "@/lib/caja/server";
import { logMovimiento } from "@/lib/caja/bitacora";
import { TURNOS, labelDe, type Turno } from "@/lib/caja/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noDb = () =>
  NextResponse.json({ error: "Falta configurar Supabase." }, { status: 503 });

async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) ?? {};
  } catch {
    return {};
  }
}

/** Suma de gastos en efectivo ligados a un turno (para el cálculo del corte). */
async function gastosEfectivoDeTurno(
  sb: ReturnType<typeof createAdminClient>,
  turnoId: string
): Promise<number> {
  const { data } = await sb
    .from("caja_gastos")
    .select("monto")
    .eq("turno_id", turnoId)
    .eq("forma_pago", "efectivo");
  return (data ?? []).reduce((a, g) => a + num((g as { monto: unknown }).monto), 0);
}

// ── Abrir turno ───────────────────────────────────────────────
export async function POST(req: Request) {
  const auth = await requireRol("operador");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();

  // No permitir dos turnos abiertos a la vez.
  const { data: abiertos } = await sb
    .from("caja_turnos")
    .select("id")
    .eq("estado", "abierto")
    .limit(1);
  if (abiertos && abiertos.length > 0) {
    return NextResponse.json(
      { error: "Ya hay un turno abierto. Ciérralo antes de abrir otro." },
      { status: 409 }
    );
  }

  const { data, error } = sanitizeAbrirTurno(await readBody(req));
  if (error) return NextResponse.json({ error }, { status: 400 });

  const { data: row, error: dbErr } = await sb
    .from("caja_turnos")
    .insert({ ...data, created_by: auth.rol })
    .select("*")
    .single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  await logMovimiento(sb, {
    rol: auth.rol,
    accion: "abrir_turno",
    detalle: `${labelDe([...TURNOS], data!.turno)} del ${data!.fecha} · fondo ${data!.fondo_inicial}`,
    ref_tipo: "turno",
    ref_id: (row as Turno).id,
    monto: data!.fondo_inicial,
  });
  return NextResponse.json({ ok: true, turno: row });
}

// ── Cerrar turno / editar (admin) ─────────────────────────────
export async function PATCH(req: Request) {
  const auth = await requireRol("operador");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();

  const body = await readBody(req);
  const id = typeof body.id === "string" ? body.id : "";
  const action = typeof body.action === "string" ? body.action : "";
  if (!id) return NextResponse.json({ error: "Falta el turno." }, { status: 400 });

  const { data: actual } = await sb
    .from("caja_turnos")
    .select("*")
    .eq("id", id)
    .single();
  if (!actual)
    return NextResponse.json({ error: "Turno no encontrado." }, { status: 404 });
  const turno = actual as Turno;

  if (action === "cerrar") {
    if (turno.estado !== "abierto")
      return NextResponse.json(
        { error: "Ese turno ya está cerrado." },
        { status: 409 }
      );
    const { data: campos } = sanitizeCerrarTurno(body);
    const gastosEf = await gastosEfectivoDeTurno(sb, id);
    const { efectivo_esperado, diferencia } = calcularCorte({
      fondo_inicial: turno.fondo_inicial,
      ventas_efectivo: campos!.ventas_efectivo as number,
      otros_ingresos: campos!.otros_ingresos as number,
      retiros: campos!.retiros as number,
      gastos_efectivo: gastosEf,
      efectivo_contado: campos!.efectivo_contado as number,
    });
    const total_ingresos =
      num(campos!.ventas_efectivo) +
      num(campos!.ventas_tarjeta) +
      num(campos!.ventas_transferencia) +
      num(campos!.ventas_booking) +
      num(campos!.otros_ingresos);

    const { data: row, error } = await sb
      .from("caja_turnos")
      .update({
        ...campos,
        estado: "cerrado",
        efectivo_esperado,
        diferencia,
        total_ingresos,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logMovimiento(sb, {
      rol: auth.rol,
      accion: "cerrar_turno",
      detalle: `${labelDe([...TURNOS], turno.turno)} del ${turno.fecha} · ingresos ${total_ingresos} · ${
        diferencia < 0 ? `faltante ${Math.abs(diferencia)}` : diferencia > 0 ? `sobrante ${diferencia}` : "caja exacta"
      }`,
      ref_tipo: "turno",
      ref_id: id,
      monto: total_ingresos,
    });
    return NextResponse.json({ ok: true, turno: row });
  }

  if (action === "editar") {
    if (auth.rol !== "admin")
      return NextResponse.json(
        { error: "Solo el dueño puede editar un turno." },
        { status: 403 }
      );
    const { data: campos } = sanitizeEditarTurno(body);
    const merged = { ...turno, ...campos } as Turno;
    const gastosEf = await gastosEfectivoDeTurno(sb, id);
    const { efectivo_esperado, diferencia } = calcularCorte({
      fondo_inicial: merged.fondo_inicial,
      ventas_efectivo: merged.ventas_efectivo,
      otros_ingresos: merged.otros_ingresos,
      retiros: merged.retiros,
      gastos_efectivo: gastosEf,
      efectivo_contado: merged.efectivo_contado,
    });
    const total_ingresos =
      num(merged.ventas_efectivo) +
      num(merged.ventas_tarjeta) +
      num(merged.ventas_transferencia) +
      num(merged.ventas_booking) +
      num(merged.otros_ingresos);

    const { data: row, error } = await sb
      .from("caja_turnos")
      .update({ ...campos, efectivo_esperado, diferencia, total_ingresos })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logMovimiento(sb, {
      rol: auth.rol,
      accion: "editar_turno",
      detalle: `${labelDe([...TURNOS], turno.turno)} del ${turno.fecha} · editado por el dueño`,
      ref_tipo: "turno",
      ref_id: id,
      monto: total_ingresos,
    });
    return NextResponse.json({ ok: true, turno: row });
  }

  return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
}

// ── Borrar turno (solo dueño) ─────────────────────────────────
export async function DELETE(req: Request) {
  const auth = await requireRol("admin");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta el turno." }, { status: 400 });
  const { error } = await sb.from("caja_turnos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
