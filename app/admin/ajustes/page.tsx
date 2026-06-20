import { redirect } from "next/navigation";
import { getRol } from "@/lib/caja/auth";
import { loadCategorias, loadMeta } from "@/lib/caja/data";
import { mesActual } from "@/lib/caja/server";
import CajaLogin from "@/components/caja/CajaLogin";
import CajaShell from "@/components/caja/CajaShell";
import AjustesPanel from "@/components/caja/AjustesPanel";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const rol = await getRol();
  if (!rol) return <CajaLogin />;
  if (rol !== "admin") redirect("/admin");

  const mes = mesActual();
  const [categorias, metaActual] = await Promise.all([
    loadCategorias(),
    loadMeta(mes),
  ]);

  return (
    <CajaShell rol={rol} active="ajustes">
      <AjustesPanel categorias={categorias} mes={mes} metaActual={metaActual} />
    </CajaShell>
  );
}
