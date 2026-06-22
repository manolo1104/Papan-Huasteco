import { redirect } from "next/navigation";
import { getRol } from "@/lib/caja/auth";
import { loadTurnos, loadGastos, loadTendencia, loadMetricasRango, loadCategorias } from "@/lib/caja/data";
import { todayISO, addDays } from "@/lib/caja/server";
import CajaLogin from "@/components/caja/CajaLogin";
import CajaShell from "@/components/caja/CajaShell";
import Reportes from "@/components/caja/Reportes";

export const dynamic = "force-dynamic";

const isDate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: { desde?: string; hasta?: string };
}) {
  const rol = await getRol();
  if (!rol) return <CajaLogin />;
  // Los reportes son solo para el dueño.
  if (rol !== "admin") redirect("/admin");

  const hasta = isDate(searchParams.hasta) ? searchParams.hasta : todayISO();
  const desde = isDate(searchParams.desde) ? searchParams.desde : addDays(hasta, -29);

  const [turnos, gastos, tendencia, metricas, categorias] = await Promise.all([
    loadTurnos(desde, hasta),
    loadGastos(desde, hasta),
    loadTendencia(hasta.slice(0, 7)),
    loadMetricasRango(desde, hasta),
    loadCategorias(),
  ]);

  return (
    <CajaShell rol={rol} active="reportes">
      <Reportes
        desde={desde}
        hasta={hasta}
        turnos={turnos}
        gastos={gastos}
        tendencia={tendencia}
        metricas={metricas}
        categorias={categorias}
      />
    </CajaShell>
  );
}
