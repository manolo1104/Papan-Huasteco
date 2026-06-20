import { NextResponse } from "next/server";
import { requireRol } from "@/lib/caja/auth";
import { createAdminClient, adminEnvReady } from "@/lib/supabase/admin";
import { sanitizeMesa } from "@/lib/caja/server";

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

// Mesas: gestión solo para el dueño (Ajustes).
export async function POST(req: Request) {
  const auth = await requireRol("admin");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();
  const { data, error } = sanitizeMesa(await readBody(req), "create");
  if (error) return NextResponse.json({ error }, { status: 400 });
  const { data: row, error: dbErr } = await sb
    .from("pos_mesas")
    .insert({ ...data })
    .select("*")
    .single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, mesa: row });
}

export async function PATCH(req: Request) {
  const auth = await requireRol("admin");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();
  const body = await readBody(req);
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Falta la mesa." }, { status: 400 });
  const { data, error } = sanitizeMesa(body, "patch");
  if (error) return NextResponse.json({ error }, { status: 400 });
  const { data: row, error: dbErr } = await sb
    .from("pos_mesas")
    .update({ ...data })
    .eq("id", id)
    .select("*")
    .single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, mesa: row });
}

export async function DELETE(req: Request) {
  const auth = await requireRol("admin");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta la mesa." }, { status: 400 });
  const { error } = await sb.from("pos_mesas").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
