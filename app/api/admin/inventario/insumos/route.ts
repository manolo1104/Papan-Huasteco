import { NextResponse } from "next/server";
import { requireRol } from "@/lib/caja/auth";
import { createAdminClient, adminEnvReady } from "@/lib/supabase/admin";
import { sanitizeInsumo, num } from "@/lib/caja/server";

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

export async function POST(req: Request) {
  const auth = await requireRol("operador");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();
  const { data, error } = sanitizeInsumo(await readBody(req), "create");
  if (error) return NextResponse.json({ error }, { status: 400 });
  const { data: row, error: dbErr } = await sb
    .from("pos_insumos")
    .insert({ ...data })
    .select("*")
    .single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, insumo: row });
}

// PATCH: editar insumo o sumar una entrada de stock (action: "entrada").
export async function PATCH(req: Request) {
  const auth = await requireRol("operador");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();
  const body = await readBody(req);
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Falta el insumo." }, { status: 400 });

  if (body.action === "entrada") {
    const cantidad = num(body.cantidad);
    const { data: ins } = await sb
      .from("pos_insumos")
      .select("stock_actual")
      .eq("id", id)
      .maybeSingle();
    if (!ins) return NextResponse.json({ error: "Insumo no encontrado." }, { status: 404 });
    const nuevo = num((ins as { stock_actual: number }).stock_actual) + cantidad;
    const { data: row, error } = await sb
      .from("pos_insumos")
      .update({ stock_actual: nuevo })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, insumo: row });
  }

  const { data, error } = sanitizeInsumo(body, "patch");
  if (error) return NextResponse.json({ error }, { status: 400 });
  const { data: row, error: dbErr } = await sb
    .from("pos_insumos")
    .update({ ...data })
    .eq("id", id)
    .select("*")
    .single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, insumo: row });
}

export async function DELETE(req: Request) {
  const auth = await requireRol("operador");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta el insumo." }, { status: 400 });
  const { error } = await sb.from("pos_insumos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
