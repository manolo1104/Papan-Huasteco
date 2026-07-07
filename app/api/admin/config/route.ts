import { NextResponse } from "next/server";
import { requireRol } from "@/lib/caja/auth";
import { createAdminClient, adminEnvReady } from "@/lib/supabase/admin";
import { guardarPin, pinConfigurado, logMovimiento } from "@/lib/caja/bitacora";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noDb = () =>
  NextResponse.json({ error: "Falta configurar Supabase." }, { status: 503 });

// ── ¿Ya hay PIN de cancelaciones? (no revela el PIN) ──────────
export async function GET() {
  const auth = await requireRol("admin");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();
  return NextResponse.json({ ok: true, pinConfigurado: await pinConfigurado(sb) });
}

// ── Definir / cambiar el PIN de cancelaciones (solo dueño) ────
export async function POST(req: Request) {
  const auth = await requireRol("admin");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) ?? {};
  } catch {
    body = {};
  }

  const r = await guardarPin(sb, body.pin);
  if ("error" in r) return NextResponse.json({ error: r.error }, { status: 400 });

  await logMovimiento(sb, {
    rol: auth.rol,
    accion: "pin_cambiado",
    detalle: "El dueño definió/cambió el PIN de cancelaciones",
    ref_tipo: "config",
  });
  return NextResponse.json({ ok: true });
}
