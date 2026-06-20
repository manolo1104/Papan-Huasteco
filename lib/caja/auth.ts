import { cookies } from "next/headers";
import { createHash } from "crypto";

// Login del panel por contraseña simple (4 roles, sin tabla de usuarios).
//   ADMIN_PASSWORD   -> "admin"    (dueño: ve y edita todo, reportes)
//   CAJA_PASSWORD    -> "operador" (encargada: caja, gastos, eventos, POS, cocina…)
//   MESERO_PASSWORD  -> "mesero"   (solo POS: tomar pedidos y cobrar)
//   COCINA_PASSWORD  -> "cocina"   (solo la pantalla de comandas)
// La cookie guarda un hash, nunca la contraseña en claro.

export type Rol = "admin" | "operador" | "mesero" | "cocina";

const COOKIE = "pph_caja";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 días

const SECRETS: Record<Rol, string> = {
  admin: process.env.ADMIN_PASSWORD || "papan-dueno",
  operador: process.env.CAJA_PASSWORD || "papan-caja",
  mesero: process.env.MESERO_PASSWORD || "papan-mesero",
  cocina: process.env.COCINA_PASSWORD || "papan-cocina",
};
const ROLES: Rol[] = ["admin", "operador", "mesero", "cocina"];

function tokenFor(rol: Rol): string {
  return createHash("sha256")
    .update(`${rol}::${SECRETS[rol]}::papan-caja-v1`)
    .digest("hex");
}

/** Devuelve el rol si la contraseña coincide con alguna; si no, null. */
export function rolForPassword(input: unknown): Rol | null {
  if (typeof input !== "string" || !input) return null;
  // El admin gana si dos roles compartieran contraseña (no debería pasar).
  for (const rol of ROLES) if (input === SECRETS[rol]) return rol;
  return null;
}

/** Lee la cookie y devuelve el rol activo (o null si no hay sesión válida). */
export async function getRol(): Promise<Rol | null> {
  const store = await cookies();
  const val = store.get(COOKIE)?.value;
  if (!val) return null;
  for (const rol of ROLES) if (val === tokenFor(rol)) return rol;
  return null;
}

export async function setCajaCookie(rol: Rol): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, tokenFor(rol), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearCajaCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/**
 * Para route handlers. Devuelve { rol } si está autorizado, o una Response de
 * error. El **admin siempre pasa**. Si no se pasan roles permitidos, basta con
 * estar autenticado. Ej: requireRol("operador") deja pasar admin+operador;
 * requireRol("operador","mesero") deja pasar admin+operador+mesero.
 */
export async function requireRol(
  ...allowed: Rol[]
): Promise<{ rol: Rol } | Response> {
  const rol = await getRol();
  if (!rol) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  if (rol === "admin") return { rol };
  if (allowed.length === 0 || allowed.includes(rol)) return { rol };
  return new Response(
    JSON.stringify({ error: "No tienes permiso para esto." }),
    { status: 403, headers: { "content-type": "application/json" } }
  );
}
