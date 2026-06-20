import { getRol } from "@/lib/caja/auth";
import { loadResumenDia, loadCategorias } from "@/lib/caja/data";
import { todayISO } from "@/lib/caja/server";
import CajaLogin from "@/components/caja/CajaLogin";
import CajaShell from "@/components/caja/CajaShell";
import ResumenDia from "@/components/caja/ResumenDia";

export const dynamic = "force-dynamic";

const isDate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

export default async function ResumenPage({
  searchParams,
}: {
  searchParams: { fecha?: string };
}) {
  const rol = await getRol();
  if (!rol) return <CajaLogin />;

  const fecha = isDate(searchParams.fecha) ? searchParams.fecha : todayISO();
  const [data, categorias] = await Promise.all([
    loadResumenDia(fecha),
    loadCategorias(),
  ]);

  return (
    <CajaShell rol={rol} active="resumen">
      <ResumenDia data={data} fecha={fecha} categorias={categorias} />
    </CajaShell>
  );
}
