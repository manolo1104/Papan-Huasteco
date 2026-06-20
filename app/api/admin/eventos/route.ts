import { NextResponse } from "next/server";
import { requireRol } from "@/lib/caja/auth";
import { createAdminClient, adminEnvReady } from "@/lib/supabase/admin";
import { sanitizeEvento } from "@/lib/caja/server";

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

// ── Crear evento ──────────────────────────────────────────────
export async function POST(req: Request) {
  const auth = await requireRol("operador");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();

  const { data, error } = sanitizeEvento(await readBody(req), "create");
  if (error) return NextResponse.json({ error }, { status: 400 });

  const { data: row, error: dbErr } = await sb
    .from("eventos")
    .insert({ ...data })
    .select("*")
    .single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, evento: row });
}

// ── Editar evento / registrar abono ───────────────────────────
export async function PATCH(req: Request) {
  const auth = await requireRol("operador");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();

  const body = await readBody(req);
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Falta el evento." }, { status: 400 });

  const { data, error } = sanitizeEvento(body, "patch");
  if (error) return NextResponse.json({ error }, { status: 400 });

  const { data: row, error: dbErr } = await sb
    .from("eventos")
    .update({ ...data })
    .eq("id", id)
    .select("*")
    .single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, evento: row });
}

// ── Borrar evento (solo dueño) ────────────────────────────────
export async function DELETE(req: Request) {
  const auth = await requireRol("admin");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta el evento." }, { status: 400 });
  const { error } = await sb.from("eventos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
