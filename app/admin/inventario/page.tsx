import { redirect } from "next/navigation";
import { getRol } from "@/lib/caja/auth";
import { loadInsumos, loadProductos, loadTodasRecetas } from "@/lib/caja/data";
import CajaLogin from "@/components/caja/CajaLogin";
import CajaShell from "@/components/caja/CajaShell";
import InventarioPanel from "@/components/caja/InventarioPanel";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const rol = await getRol();
  if (!rol) return <CajaLogin />;
  if (rol === "mesero" || rol === "cocina") redirect("/admin/pos");

  const [insumos, productos, recetasPorProducto] = await Promise.all([
    loadInsumos(),
    loadProductos(),
    loadTodasRecetas(),
  ]);
  return (
    <CajaShell rol={rol} active="inventario">
      <InventarioPanel insumos={insumos} productos={productos} recetasPorProducto={recetasPorProducto} />
    </CajaShell>
  );
}
