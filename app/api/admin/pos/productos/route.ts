import { NextResponse } from "next/server";
import { requireRol } from "@/lib/caja/auth";
import { createAdminClient, adminEnvReady } from "@/lib/supabase/admin";
import { sanitizeProducto } from "@/lib/caja/server";
import { MENU } from "@/lib/menu";

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

/** Primer número de un precio: "$90 - $125" -> 90, "$150" -> 150. */
function parsePrecio(price: string): number {
  const m = price.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : 0;
}

// ── Crear producto / Importar menú ────────────────────────────
export async function POST(req: Request) {
  const auth = await requireRol("operador");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();
  const body = await readBody(req);

  // Importar/actualizar el menú del sitio (lib/menu.ts) → upsert por nombre.
  if (body.action === "importar") {
    const filas: { nombre: string; descripcion: string | null; categoria: string; precio: number; orden: number }[] = [];
    let orden = 0;
    for (const cat of MENU) {
      if (cat.featured) {
        filas.push({
          nombre: cat.featured.name,
          descripcion: cat.featured.desc ?? null,
          categoria: cat.label,
          precio: parsePrecio(cat.featured.price),
          orden: (orden += 10),
        });
      }
      for (const item of cat.items) {
        filas.push({
          nombre: item.name,
          descripcion: item.desc ?? null,
          categoria: cat.label,
          precio: parsePrecio(item.price),
          orden: (orden += 10),
        });
      }
    }
    // Insertar solo los que aún no existen (comparando por nombre sin distinguir
    // mayúsculas). Así "Importar" se puede repetir sin duplicar ni pisar precios.
    const { data: existentesData } = await sb.from("pos_productos").select("nombre");
    const existentes = new Set(
      ((existentesData as { nombre: string }[]) ?? []).map((p) => p.nombre.toLowerCase())
    );
    const vistos = new Set<string>();
    const nuevos = filas.filter((f) => {
      const key = f.nombre.toLowerCase();
      if (existentes.has(key) || vistos.has(key)) return false;
      vistos.add(key);
      return true;
    });
    if (nuevos.length > 0) {
      const { error } = await sb.from("pos_productos").insert(nuevos);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const { count } = await sb
      .from("pos_productos")
      .select("id", { count: "exact", head: true });
    return NextResponse.json({ ok: true, total: count ?? 0, nuevos: nuevos.length });
  }

  const { data, error } = sanitizeProducto(body, "create");
  if (error) return NextResponse.json({ error }, { status: 400 });
  const { data: row, error: dbErr } = await sb
    .from("pos_productos")
    .insert({ ...data })
    .select("*")
    .single();
  if (dbErr) {
    const msg = dbErr.code === "23505" ? "Ya existe un producto con ese nombre." : dbErr.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true, producto: row });
}

// ── Editar producto (precio / disponible / nombre) ────────────
export async function PATCH(req: Request) {
  const auth = await requireRol("operador");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();

  const body = await readBody(req);
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Falta el producto." }, { status: 400 });

  const { data, error } = sanitizeProducto(body, "patch");
  if (error) return NextResponse.json({ error }, { status: 400 });
  const { data: row, error: dbErr } = await sb
    .from("pos_productos")
    .update({ ...data })
    .eq("id", id)
    .select("*")
    .single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, producto: row });
}

// ── Borrar producto (solo dueño) ──────────────────────────────
export async function DELETE(req: Request) {
  const auth = await requireRol("admin");
  if (auth instanceof Response) return auth;
  if (!adminEnvReady) return noDb();
  const sb = createAdminClient();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta el producto." }, { status: 400 });
  const { error } = await sb.from("pos_productos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
