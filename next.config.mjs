/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // El panel /admin (POS, cocina, turnos) debe verse SIEMPRE fresco.
    // Sin esto, el Router Cache del cliente reutiliza hasta 30s el payload
    // de /admin/pos?mesa=A al abrir la mesa B → se pintaba la cuenta de otra
    // mesa (bug reportado por el dueño).
    staleTimes: { dynamic: 0 },
  },
};

export default nextConfig;
