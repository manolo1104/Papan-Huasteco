import { NextResponse } from "next/server";
import { requireRol } from "@/lib/caja/auth";
import { createAdminClient, adminEnvReady } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const TIPOS_OK = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

// Sube la foto de un ticket al bucket "tickets" y devuelve su URL pública.
export async function POST(req: Request) {
  // Operador sube tickets de gastos; mesero sube vouchers de cobro (Clip).
  const auth = await requireRol("operador", "mesero");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady)
    return NextResponse.json({ error: "Falta configurar Supabase." }, { status: 503 });

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    /* sin form */
  }
  if (!file) return NextResponse.json({ error: "No llegó ninguna imagen." }, { status: 400 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "La imagen es muy grande (máx 8 MB)." }, { status: 400 });
  if (file.type && !TIPOS_OK.includes(file.type))
    return NextResponse.json({ error: "Formato no permitido (usa foto o PDF)." }, { status: 400 });

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
  const nombre = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const sb = createAdminClient();
  const { error } = await sb.storage
    .from("tickets")
    .upload(nombre, buffer, { contentType: file.type || "image/jpeg", upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = sb.storage.from("tickets").getPublicUrl(nombre);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
