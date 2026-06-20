import { NextResponse } from "next/server";
import { requireRol } from "@/lib/caja/auth";
import { createAdminClient, adminEnvReady } from "@/lib/supabase/admin";
import { num } from "@/lib/caja/server";

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

// Fija/actualiza un renglón de receta (producto + insumo + cantidad).
// cantidad <= 0 quita el insumo de la receta.
export async function POST(req: Request) {
  const auth = await requireRol("operador");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();
  const body = await readBody(req);
  const producto_id = typeof body.producto_id === "string" ? body.producto_id : "";
  const insumo_id = typeof body.insumo_id === "string" ? body.insumo_id : "";
  if (!producto_id || !insumo_id)
    return NextResponse.json({ error: "Falta el producto o el insumo." }, { status: 400 });

  const cantidad = num(body.cantidad);
  if (cantidad <= 0) {
    await sb
      .from("pos_recetas")
      .delete()
      .eq("producto_id", producto_id)
      .eq("insumo_id", insumo_id);
    return NextResponse.json({ ok: true, removed: true });
  }

  const { error } = await sb
    .from("pos_recetas")
    .upsert({ producto_id, insumo_id, cantidad }, { onConflict: "producto_id,insumo_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
