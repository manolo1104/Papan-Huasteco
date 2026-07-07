import { NextResponse } from "next/server";
import { requireRol } from "@/lib/caja/auth";
import { createAdminClient, adminEnvReady } from "@/lib/supabase/admin";
import { sanitizeItem, num } from "@/lib/caja/server";
import { logMovimiento, verificarPin } from "@/lib/caja/bitacora";
import type { OrdenItem, Orden, Receta, Insumo } from "@/lib/caja/types";

/** Mapa whitelist forma de cobro → columna del turno. Cualquier otra forma se
 * rechaza: si algo mal escrito cayera a "efectivo" inflaría el efectivo
 * esperado del corte y generaría falsos faltantes. */
const FORMA_A_CAMPO: Record<string, string> = {
  efectivo: "ventas_efectivo",
  tarjeta: "ventas_tarjeta",
  transferencia: "ventas_transferencia",
  booking: "ventas_booking",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SB = ReturnType<typeof createAdminClient>;

const noDb = () =>
  NextResponse.json({ error: "Falta configurar Supabase." }, { status: 503 });

async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) ?? {};
  } catch {
    return {};
  }
}

/** Recalcula y guarda el total de la orden a partir de sus renglones. */
async function recomputeTotal(sb: SB, ordenId: string): Promise<number> {
  const { data } = await sb
    .from("pos_orden_items")
    .select("precio_unit, cantidad")
    .eq("orden_id", ordenId);
  const total = ((data as { precio_unit: number; cantidad: number }[]) ?? []).reduce(
    (a, i) => a + num(i.precio_unit) * num(i.cantidad),
    0
  );
  await sb.from("pos_ordenes").update({ total }).eq("id", ordenId);
  return total;
}

// ── Abrir (o recuperar) la orden de una mesa ──────────────────
export async function POST(req: Request) {
  const auth = await requireRol("operador", "mesero");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();
  const body = await readBody(req);
  const mesa = typeof body.mesa_nombre === "string" ? body.mesa_nombre.trim() : "";
  if (!mesa) return NextResponse.json({ error: "Falta la mesa." }, { status: 400 });

  const { data: existente } = await sb
    .from("pos_ordenes")
    .select("*")
    .eq("mesa_nombre", mesa)
    .eq("estado", "abierta")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existente) return NextResponse.json({ ok: true, orden: existente });

  const { data: row, error } = await sb
    .from("pos_ordenes")
    .insert({ mesa_nombre: mesa, mesero: auth.rol })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, orden: row });
}

// ── Acciones sobre una orden ──────────────────────────────────
export async function PATCH(req: Request) {
  const auth = await requireRol("operador", "mesero");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();
  const body = await readBody(req);
  const id = typeof body.id === "string" ? body.id : "";
  const action = typeof body.action === "string" ? body.action : "";
  if (!id) return NextResponse.json({ error: "Falta la orden." }, { status: 400 });

  const { data: ordRow } = await sb.from("pos_ordenes").select("*").eq("id", id).maybeSingle();
  if (!ordRow) return NextResponse.json({ error: "Orden no encontrada." }, { status: 404 });
  const orden = ordRow as Orden;
  if (orden.estado !== "abierta")
    return NextResponse.json({ error: "Esa orden ya está cerrada." }, { status: 409 });

  // Defensa contra cuentas cruzadas: si el cliente dice desde qué mesa opera,
  // la orden DEBE ser de esa mesa (la UI podría traer datos viejos en caché).
  const mesaBody = typeof body.mesa_nombre === "string" ? body.mesa_nombre.trim() : "";
  if (mesaBody && mesaBody !== orden.mesa_nombre)
    return NextResponse.json(
      { error: "Esa cuenta es de otra mesa. Recarga la pantalla." },
      { status: 409 }
    );

  // Agregar un renglón. Si el mismo producto ya está y aún no se manda a
  // cocina, suma a su cantidad (en vez de duplicar el renglón).
  if (action === "agregar") {
    const { data, error } = sanitizeItem(body);
    if (error) return NextResponse.json({ error }, { status: 400 });
    const d = data!;
    let merged = false;
    if (d.producto_id) {
      // Solo se fusiona con un renglón del mismo producto que NO esté
      // personalizado (sin nota). Así "2 enchiladas sin cebolla" no se
      // mezcla con una enchilada normal: quedan en renglones aparte.
      const { data: ex } = await sb
        .from("pos_orden_items")
        .select("id, cantidad")
        .eq("orden_id", id)
        .eq("producto_id", d.producto_id as string)
        .eq("enviado_cocina", false)
        .is("nota", null)
        .limit(1)
        .maybeSingle();
      if (ex) {
        await sb
          .from("pos_orden_items")
          .update({ cantidad: num((ex as { cantidad: number }).cantidad) + num(d.cantidad) })
          .eq("id", (ex as { id: string }).id);
        merged = true;
      }
    }
    if (!merged) {
      const { error: dbErr } = await sb
        .from("pos_orden_items")
        .insert({ ...d, orden_id: id });
      if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }
    const total = await recomputeTotal(sb, id);
    return NextResponse.json({ ok: true, total });
  }

  // Fijar el número de personas de la mesa
  if (action === "set_personas") {
    const n = Math.floor(num(body.personas));
    const personas = n > 0 ? Math.min(n, 200) : null;
    const { error } = await sb.from("pos_ordenes").update({ personas }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, personas });
  }

  // Borrar un renglón. Si YA se mandó a cocina, es una cancelación real:
  // pide PIN y queda en la bitácora.
  if (action === "borrar_item") {
    const itemId = typeof body.item_id === "string" ? body.item_id : "";
    if (!itemId) return NextResponse.json({ error: "Falta el renglón." }, { status: 400 });
    const { data: itRow } = await sb
      .from("pos_orden_items")
      .select("*")
      .eq("id", itemId)
      .eq("orden_id", id)
      .maybeSingle();
    if (!itRow) return NextResponse.json({ error: "Renglón no encontrado." }, { status: 404 });
    const item = itRow as OrdenItem;

    if (item.enviado_cocina) {
      const pin = await verificarPin(sb, body.pin);
      if (pin === "sin_pin")
        return NextResponse.json(
          { error: "No hay PIN de cancelaciones configurado. El dueño debe crearlo en Ajustes." },
          { status: 403 }
        );
      if (pin === "malo")
        return NextResponse.json({ error: "PIN incorrecto." }, { status: 403 });
    }

    await sb.from("pos_orden_items").delete().eq("id", itemId).eq("orden_id", id);
    const total = await recomputeTotal(sb, id);
    if (item.enviado_cocina) {
      await logMovimiento(sb, {
        rol: auth.rol,
        accion: "borrar_item_enviado",
        detalle: `${orden.mesa_nombre} · ${item.cantidad}× ${item.nombre} (ya estaba en cocina)`,
        ref_tipo: "orden",
        ref_id: id,
        monto: num(item.precio_unit) * num(item.cantidad),
      });
    }
    return NextResponse.json({ ok: true, total });
  }

  // Cambiar la cantidad de un renglón (solo si aún no se mandó a cocina).
  // cantidad <= 0 borra el renglón.
  if (action === "item_cantidad") {
    const itemId = typeof body.item_id === "string" ? body.item_id : "";
    if (!itemId) return NextResponse.json({ error: "Falta el renglón." }, { status: 400 });
    const cant = Math.floor(num(body.cantidad));
    if (cant <= 0) {
      await sb.from("pos_orden_items").delete().eq("id", itemId).eq("orden_id", id).eq("enviado_cocina", false);
    } else {
      await sb
        .from("pos_orden_items")
        .update({ cantidad: cant })
        .eq("id", itemId)
        .eq("orden_id", id)
        .eq("enviado_cocina", false);
    }
    const total = await recomputeTotal(sb, id);
    return NextResponse.json({ ok: true, total });
  }

  // Personalizar un renglón (ej. "Sin cebolla, sin crema"). Solo se puede
  // mientras NO se haya mandado a cocina. La nota aparece en la comanda.
  if (action === "item_nota") {
    const itemId = typeof body.item_id === "string" ? body.item_id : "";
    if (!itemId) return NextResponse.json({ error: "Falta el renglón." }, { status: 400 });
    const raw = typeof body.nota === "string" ? body.nota.trim() : "";
    const nota = raw ? raw.slice(0, 300) : null;
    const { error } = await sb
      .from("pos_orden_items")
      .update({ nota })
      .eq("id", itemId)
      .eq("orden_id", id)
      .eq("enviado_cocina", false);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Enviar a cocina los renglones que aún no se han mandado
  if (action === "enviar_cocina") {
    const { error } = await sb
      .from("pos_orden_items")
      .update({ enviado_cocina: true })
      .eq("orden_id", id)
      .eq("enviado_cocina", false);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Cancelar la orden completa: pide PIN y queda en la bitácora
  if (action === "cancelar") {
    const pin = await verificarPin(sb, body.pin);
    if (pin === "sin_pin")
      return NextResponse.json(
        { error: "No hay PIN de cancelaciones configurado. El dueño debe crearlo en Ajustes." },
        { status: 403 }
      );
    if (pin === "malo")
      return NextResponse.json({ error: "PIN incorrecto." }, { status: 403 });

    await sb.from("pos_ordenes").update({ estado: "cancelada" }).eq("id", id);
    await logMovimiento(sb, {
      rol: auth.rol,
      accion: "cancelar_orden",
      detalle: `${orden.mesa_nombre} · cuenta cancelada`,
      ref_tipo: "orden",
      ref_id: id,
      monto: num(orden.total),
    });
    return NextResponse.json({ ok: true });
  }

  // Cobrar: cierra la orden, suma al turno abierto y descuenta inventario
  if (action === "cobrar") {
    const forma = typeof body.forma_pago === "string" ? body.forma_pago : "";
    const campo = FORMA_A_CAMPO[forma];
    if (!campo)
      return NextResponse.json({ error: "Forma de pago no válida." }, { status: 400 });

    // 1) Debe haber un turno abierto para registrar la venta
    const { data: turnoRow } = await sb
      .from("caja_turnos")
      .select("*")
      .eq("estado", "abierto")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!turnoRow)
      return NextResponse.json(
        { error: "No hay un turno abierto. Pídele a la encargada que abra la caja." },
        { status: 409 }
      );

    // 2) Total final
    const total = await recomputeTotal(sb, id);
    if (total <= 0)
      return NextResponse.json({ error: "La orden está vacía." }, { status: 400 });

    // Datos del cobro (todos opcionales)
    const personasN = Math.floor(num(body.personas));
    const personas = personasN > 0 ? Math.min(personasN, 200) : orden.personas;
    const pagoRecibido = forma === "efectivo" && num(body.pago_recibido) > 0 ? num(body.pago_recibido) : null;
    const referencia =
      typeof body.pago_referencia === "string" && body.pago_referencia.trim()
        ? body.pago_referencia.trim().slice(0, 120)
        : null;
    const comprobante =
      typeof body.comprobante_url === "string" && body.comprobante_url.trim()
        ? body.comprobante_url.trim()
        : null;

    // 3) Cerrar la orden
    const { error: cErr } = await sb
      .from("pos_ordenes")
      .update({
        estado: "cobrada",
        forma_pago: forma,
        turno_id: turnoRow.id,
        total,
        personas,
        pago_recibido: pagoRecibido,
        pago_referencia: referencia,
        comprobante_url: comprobante,
        cobrada_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

    // 4) Sumar la venta al turno con RPC ATÓMICO (sin carrera entre dos cajas)
    const { error: rpcErr } = await sb.rpc("sumar_venta_turno", {
      p_turno: turnoRow.id,
      p_forma: forma,
      p_monto: total,
    });
    if (rpcErr) {
      // Compensación: la venta NO entró al turno → la orden vuelve a abierta
      // para que el cobro se pueda reintentar sin dejar dinero fantasma.
      await sb
        .from("pos_ordenes")
        .update({ estado: "abierta", forma_pago: null, turno_id: null, cobrada_at: null })
        .eq("id", id);
      return NextResponse.json(
        { error: "No se pudo sumar al turno. ¿Ya se corrió la migración fase 5 en Supabase?" },
        { status: 500 }
      );
    }

    // 5) Descontar inventario según las recetas
    await descontarInventario(sb, id);

    await logMovimiento(sb, {
      rol: auth.rol,
      accion: "cobrar",
      detalle: `${orden.mesa_nombre} · $${total} en ${forma}${personas ? ` · ${personas} personas` : ""}${referencia ? ` · ref: ${referencia}` : ""}`,
      ref_tipo: "orden",
      ref_id: id,
      monto: total,
    });

    return NextResponse.json({ ok: true, total });
  }

  return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
}

/** Resta del stock los insumos de cada platillo cobrado (si tiene receta). */
async function descontarInventario(sb: SB, ordenId: string) {
  const { data: itemsData } = await sb
    .from("pos_orden_items")
    .select("producto_id, cantidad")
    .eq("orden_id", ordenId);
  const items = (itemsData as Pick<OrdenItem, "producto_id" | "cantidad">[]) ?? [];
  const productoIds = Array.from(
    new Set(items.map((i) => i.producto_id).filter((x): x is string => Boolean(x)))
  );
  if (productoIds.length === 0) return;

  const { data: recData } = await sb
    .from("pos_recetas")
    .select("*")
    .in("producto_id", productoIds);
  const recetas = (recData as Receta[]) ?? [];
  if (recetas.length === 0) return;

  // Cantidad total a descontar por insumo
  const descuento = new Map<string, number>();
  for (const it of items) {
    if (!it.producto_id) continue;
    for (const r of recetas.filter((r) => r.producto_id === it.producto_id)) {
      descuento.set(r.insumo_id, (descuento.get(r.insumo_id) || 0) + r.cantidad * num(it.cantidad));
    }
  }
  if (descuento.size === 0) return;

  const { data: insData } = await sb
    .from("pos_insumos")
    .select("id, stock_actual")
    .in("id", Array.from(descuento.keys()));
  for (const ins of (insData as Pick<Insumo, "id" | "stock_actual">[]) ?? []) {
    const nuevo = num(ins.stock_actual) - (descuento.get(ins.id) || 0);
    await sb.from("pos_insumos").update({ stock_actual: nuevo }).eq("id", ins.id);
  }
}
