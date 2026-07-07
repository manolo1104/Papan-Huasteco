import { createHash } from "crypto";
import type { createAdminClient } from "@/lib/supabase/admin";
import type { Rol } from "./auth";
import type { BitacoraAccion } from "./types";

// Bitácora de movimientos + PIN de cancelaciones. SOLO servidor.

type SB = ReturnType<typeof createAdminClient>;

/**
 * Registra un movimiento en la bitácora. Es "best-effort": si la tabla aún no
 * existe (migración fase 5 sin correr) o falla el insert, NO rompe la
 * operación principal — solo queda sin registro.
 */
export async function logMovimiento(
  sb: SB,
  entrada: {
    rol: Rol | string;
    accion: BitacoraAccion;
    detalle?: string;
    ref_tipo?: "orden" | "turno" | "gasto" | "config";
    ref_id?: string | null;
    monto?: number | null;
  }
): Promise<void> {
  try {
    await sb.from("caja_bitacora").insert({
      rol: entrada.rol,
      accion: entrada.accion,
      detalle: entrada.detalle ?? null,
      ref_tipo: entrada.ref_tipo ?? null,
      ref_id: entrada.ref_id ?? null,
      monto: entrada.monto ?? null,
    });
  } catch {
    // nunca tirar la operación por la bitácora
  }
}

// ── PIN de cancelaciones ──────────────────────────────────────
// Se guarda HASHEADO en caja_config (clave "pin_cancelacion"), igual que las
// contraseñas de login: nunca en claro.

const PIN_CLAVE = "pin_cancelacion";

export function hashPin(pin: string): string {
  return createHash("sha256").update(`pin::${pin.trim()}::papan-caja-v1`).digest("hex");
}

/** ¿Ya hay un PIN configurado? */
export async function pinConfigurado(sb: SB): Promise<boolean> {
  const { data } = await sb
    .from("caja_config")
    .select("clave")
    .eq("clave", PIN_CLAVE)
    .maybeSingle();
  return Boolean(data);
}

/**
 * Verifica un PIN contra el guardado.
 * Devuelve: "ok" | "malo" (no coincide) | "sin_pin" (nadie lo ha configurado).
 */
export async function verificarPin(
  sb: SB,
  pin: unknown
): Promise<"ok" | "malo" | "sin_pin"> {
  const { data } = await sb
    .from("caja_config")
    .select("valor")
    .eq("clave", PIN_CLAVE)
    .maybeSingle();
  if (!data?.valor) return "sin_pin";
  if (typeof pin !== "string" || !pin.trim()) return "malo";
  return hashPin(pin) === data.valor ? "ok" : "malo";
}

/** Guarda (o cambia) el PIN. Valida 4 a 8 dígitos. */
export async function guardarPin(
  sb: SB,
  pin: unknown
): Promise<{ ok: true } | { error: string }> {
  if (typeof pin !== "string" || !/^\d{4,8}$/.test(pin.trim()))
    return { error: "El PIN debe ser de 4 a 8 dígitos." };
  const { error } = await sb
    .from("caja_config")
    .upsert({ clave: PIN_CLAVE, valor: hashPin(pin), updated_at: new Date().toISOString() });
  if (error) return { error: "No se pudo guardar el PIN (¿ya corriste la migración fase 5?)." };
  return { ok: true };
}
