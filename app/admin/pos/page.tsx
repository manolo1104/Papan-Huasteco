import { redirect } from "next/navigation";
import { getRol } from "@/lib/caja/auth";
import { loadMesas, loadOrdenesAbiertas, loadProductos, loadOrdenDeMesa } from "@/lib/caja/data";
import CajaLogin from "@/components/caja/CajaLogin";
import CajaShell from "@/components/caja/CajaShell";
import PosPanel from "@/components/caja/PosPanel";

export const dynamic = "force-dynamic";

export default async function PosPage({
  searchParams,
}: {
  searchParams: { mesa?: string };
}) {
  const rol = await getRol();
  if (!rol) return <CajaLogin />;
  if (rol === "cocina") redirect("/admin/cocina");

  const mesaSel = typeof searchParams.mesa === "string" ? searchParams.mesa : null;
  const [mesas, ordenesAbiertas, productos, ordenSel] = await Promise.all([
    loadMesas(),
    loadOrdenesAbiertas(),
    loadProductos(true),
    mesaSel ? loadOrdenDeMesa(mesaSel) : Promise.resolve(null),
  ]);

  return (
    <CajaShell rol={rol} active="pos">
      <PosPanel
        rol={rol}
        mesas={mesas}
        ordenesAbiertas={ordenesAbiertas}
        productos={productos}
        mesaSel={mesaSel}
        orden={ordenSel?.orden ?? null}
        items={ordenSel?.items ?? []}
      />
    </CajaShell>
  );
}
