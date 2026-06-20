import { NextResponse } from "next/server";
import { requireRol } from "@/lib/caja/auth";
import { createAdminClient, adminEnvReady } from "@/lib/supabase/admin";
import { loadCocina } from "@/lib/caja/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: lista de comandas pendientes (la pantalla de cocina hace polling aquí).
export async function GET() {
  const auth = await requireRol("operador", "cocina");
  if (auth instanceof Response) return auth;
  const comandas = await loadCocina();
  return NextResponse.json({ ok: true, comandas });
}

// PATCH: marcar un renglón (o una comanda entera) como listo.
export async function PATCH(req: Request) {
  const auth = await requireRol("operador", "cocina");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady)
    return NextResponse.json({ error: "Falta configurar Supabase." }, { status: 503 });
  const sb = createAdminClient();

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) ?? {};
  } catch {
    /* vacío */
  }
  const itemId = typeof body.item_id === "string" ? body.item_id : "";
  const ordenId = typeof body.orden_id === "string" ? body.orden_id : "";

  let q = sb.from("pos_orden_items").update({ estado: "listo" }).eq("estado", "pendiente");
  if (itemId) q = q.eq("id", itemId);
  else if (ordenId) q = q.eq("orden_id", ordenId);
  else return NextResponse.json({ error: "Falta el renglón o la comanda." }, { status: 400 });

  const { error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
