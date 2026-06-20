import { createClient } from "@supabase/supabase-js";

// Cliente Supabase con service-role: SOLO servidor. Salta RLS, así que NUNCA
// debe importarse en componentes de cliente. Lo usan las rutas /api/admin y las
// páginas del panel /admin, protegidas por contraseña (ver lib/caja/auth.ts).
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** true solo cuando la URL y la service-role key están configuradas. */
export const adminEnvReady = Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);

export function createAdminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
