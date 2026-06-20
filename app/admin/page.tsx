import { redirect } from "next/navigation";
import { getRol } from "@/lib/caja/auth";
import { loadDashboard, loadCategorias } from "@/lib/caja/data";
import CajaLogin from "@/components/caja/CajaLogin";
import CajaShell from "@/components/caja/CajaShell";
import Dashboard from "@/components/caja/Dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const rol = await getRol();
  if (!rol) return <CajaLogin />;
  // El personal va directo a su pantalla.
  if (rol === "mesero") redirect("/admin/pos");
  if (rol === "cocina") redirect("/admin/cocina");
  const [data, categorias] = await Promise.all([loadDashboard(), loadCategorias()]);
  return (
    <CajaShell rol={rol} active="inicio">
      <Dashboard rol={rol} data={data} categorias={categorias} />
    </CajaShell>
  );
}
