"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Rol } from "@/lib/caja/auth";

type NavItem = {
  id: string;
  href: string;
  label: string;
  icon: string;
  roles: Rol[]; // roles que ven esta opción (admin siempre la ve)
};

const NAV: NavItem[] = [
  { id: "inicio", href: "/admin", label: "Inicio", icon: "🏠", roles: ["admin", "operador"] },
  { id: "pos", href: "/admin/pos", label: "POS / Mesas", icon: "🍽️", roles: ["admin", "operador", "mesero"] },
  { id: "cocina", href: "/admin/cocina", label: "Cocina", icon: "👨‍🍳", roles: ["admin", "operador", "cocina"] },
  { id: "turnos", href: "/admin/turnos", label: "Turnos", icon: "🧾", roles: ["admin", "operador"] },
  { id: "gastos", href: "/admin/gastos", label: "Gastos", icon: "💸", roles: ["admin", "operador"] },
  { id: "eventos", href: "/admin/eventos", label: "Eventos", icon: "🎉", roles: ["admin", "operador"] },
  { id: "productos", href: "/admin/productos", label: "Productos", icon: "📋", roles: ["admin", "operador"] },
  { id: "inventario", href: "/admin/inventario", label: "Inventario", icon: "📦", roles: ["admin", "operador"] },
  { id: "resumen", href: "/admin/resumen", label: "Resumen", icon: "📅", roles: ["admin", "operador"] },
  { id: "reportes", href: "/admin/reportes", label: "Reportes", icon: "📊", roles: ["admin"] },
  { id: "ajustes", href: "/admin/ajustes", label: "Ajustes", icon: "⚙️", roles: ["admin"] },
];

const ROL_LABEL: Record<Rol, string> = {
  admin: "Dueño",
  operador: "Encargada",
  mesero: "Mesero",
  cocina: "Cocina",
};

export default function CajaShell({
  rol,
  active,
  children,
}: {
  rol: Rol;
  active: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const items = NAV.filter((n) => rol === "admin" || n.roles.includes(rol));

  async function salir() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="caja-shell">
      <aside className="caja-sidebar">
        <div className="caja-sidebar__brand">
          <span className="caja-sidebar__dot" />
          El Papán
        </div>
        <nav className="caja-nav">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              className={`caja-nav__item ${active === n.id ? "is-active" : ""}`}
            >
              <span aria-hidden>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="caja-sidebar__foot">
          <span className="caja-rolchip">{ROL_LABEL[rol]}</span>
          <button className="caja-btn caja-btn--ghost caja-btn--sm" onClick={salir}>
            Salir
          </button>
        </div>
      </aside>
      <main className="caja-main">{children}</main>

      {/* Barra inferior dedo-friendly (solo móvil) */}
      <nav className="caja-bottomnav">
        {items.slice(0, 5).map((n) => (
          <Link
            key={n.id}
            href={n.href}
            className={`caja-bottomnav__item ${active === n.id ? "is-active" : ""}`}
          >
            <span aria-hidden>{n.icon}</span>
            <span>{n.label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
