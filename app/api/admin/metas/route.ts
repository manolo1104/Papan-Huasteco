import { NextResponse } from "next/server";
import { requireRol } from "@/lib/caja/auth";
import { createAdminClient, adminEnvReady } from "@/lib/supabase/admin";
import { sanitizeMeta } from "@/lib/caja/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) ?? {};
  } catch {
    return {};
  }
}

// ── Fijar / actualizar la meta de ventas de un mes (solo dueño) ──
export async function POST(req: Request) {
  const auth = await requireRol("admin");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady)
    return NextResponse.json({ error: "Falta configurar Supabase." }, { status: 503 });
  const sb = createAdminClient();

  const { data, error } = sanitizeMeta(await readBody(req));
  if (error) return NextResponse.json({ error }, { status: 400 });

  const { data: row, error: dbErr } = await sb
    .from("caja_metas")
    .upsert({ ...data }, { onConflict: "mes" })
    .select("*")
    .single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, meta: row });
}
