import { redirect } from "next/navigation";
import { getRol } from "@/lib/caja/auth";
import { loadCosteo } from "@/lib/caja/data";
import CajaLogin from "@/components/caja/CajaLogin";
import CajaShell from "@/components/caja/CajaShell";
import ProductosPanel from "@/components/caja/ProductosPanel";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  const rol = await getRol();
  if (!rol) return <CajaLogin />;
  if (rol === "mesero" || rol === "cocina") redirect("/admin/pos");

  const productos = await loadCosteo();
  return (
    <CajaShell rol={rol} active="productos">
      <ProductosPanel rol={rol} productos={productos} />
    </CajaShell>
  );
}
