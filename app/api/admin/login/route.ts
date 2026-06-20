import { NextResponse } from "next/server";
import { rolForPassword, setCajaCookie } from "@/lib/caja/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Rate limit best-effort por IP (en memoria; se reinicia con cada instancia).
const VENTANA_MS = 5 * 60_000;
const MAX_INTENTOS = 10;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const ahora = Date.now();
  const previos = (hits.get(ip) || []).filter((t) => ahora - t < VENTANA_MS);
  previos.push(ahora);
  hits.set(ip, previos);
  return previos.length > MAX_INTENTOS;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos." },
      { status: 429 }
    );
  }

  let password = "";
  try {
    const body = await req.json();
    password = body?.password ?? "";
  } catch {
    /* sin cuerpo */
  }

  const rol = rolForPassword(password);
  if (!rol) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }
  await setCajaCookie(rol);
  return NextResponse.json({ ok: true, rol });
}
