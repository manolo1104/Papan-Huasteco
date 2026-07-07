import { NextResponse } from "next/server";
import { requireRol } from "@/lib/caja/auth";
import { createAdminClient, adminEnvReady } from "@/lib/supabase/admin";
import { sanitizeGasto } from "@/lib/caja/server";
import { logMovimiento } from "@/lib/caja/bitacora";
import type { Gasto } from "@/lib/caja/types";

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

// ── Registrar gasto ───────────────────────────────────────────
export async function POST(req: Request) {
  const auth = await requireRol("operador");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();

  const { data, error } = sanitizeGasto(await readBody(req), "create");
  if (error) return NextResponse.json({ error }, { status: 400 });

  const { data: row, error: dbErr } = await sb
    .from("caja_gastos")
    .insert({ ...data, created_by: auth.rol })
    .select("*")
    .single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  const g = row as Gasto;
  await logMovimiento(sb, {
    rol: auth.rol,
    accion: "gasto_creado",
    detalle: `${g.concepto} · ${g.forma_pago}${g.turno_id ? " · ligado al turno" : ""}`,
    ref_tipo: "gasto",
    ref_id: g.id,
    monto: g.monto,
  });
  return NextResponse.json({ ok: true, gasto: row });
}

// ── Ligar un gasto al turno abierto ───────────────────────────
// Se usa desde el cierre de turno cuando hay gastos del día que se
// registraron sin ligar (para que sí entren al corte).
export async function PATCH(req: Request) {
  const auth = await requireRol("operador");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();

  const body = await readBody(req);
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Falta el gasto." }, { status: 400 });

  if (body.action === "ligar_turno") {
    const { data: abierto } = await sb
      .from("caja_turnos")
      .select("id")
      .eq("estado", "abierto")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!abierto)
      return NextResponse.json({ error: "No hay un turno abierto." }, { status: 409 });
    const { error } = await sb
      .from("caja_gastos")
      .update({ turno_id: abierto.id })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
}

// ── Borrar gasto ──────────────────────────────────────────────
// El dueño borra cualquiera. La encargada solo puede borrar gastos que NO estén
// ligados a un turno ya cerrado (una vez cerrado el corte, los números se fijan).
export async function DELETE(req: Request) {
  const auth = await requireRol("operador");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta el gasto." }, { status: 400 });

  if (auth.rol !== "admin") {
    const { data: gasto } = await sb
      .from("caja_gastos")
      .select("turno_id")
      .eq("id", id)
      .single();
    const turnoId = (gasto as Pick<Gasto, "turno_id"> | null)?.turno_id;
    if (turnoId) {
      const { data: turno } = await sb
        .from("caja_turnos")
        .select("estado")
        .eq("id", turnoId)
        .single();
      if ((turno as { estado?: string } | null)?.estado === "cerrado") {
        return NextResponse.json(
          { error: "Ese gasto pertenece a un turno cerrado. Pídeselo al dueño." },
          { status: 403 }
        );
      }
    }
  }

  const { data: previo } = await sb
    .from("caja_gastos")
    .select("concepto, monto")
    .eq("id", id)
    .maybeSingle();
  const { error } = await sb.from("caja_gastos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logMovimiento(sb, {
    rol: auth.rol,
    accion: "gasto_borrado",
    detalle: previo ? `${(previo as { concepto: string }).concepto}` : "gasto borrado",
    ref_tipo: "gasto",
    ref_id: id,
    monto: previo ? (previo as { monto: number }).monto : null,
  });
  return NextResponse.json({ ok: true });
}
