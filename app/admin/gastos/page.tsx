import { getRol } from "@/lib/caja/auth";
import { loadGastos, loadTurnoAbierto, loadCategorias } from "@/lib/caja/data";
import CajaLogin from "@/components/caja/CajaLogin";
import CajaShell from "@/components/caja/CajaShell";
import GastosPanel from "@/components/caja/GastosPanel";

export const dynamic = "force-dynamic";

export default async function GastosPage() {
  const rol = await getRol();
  if (!rol) return <CajaLogin />;

  const [gastos, turnoAbierto, categorias] = await Promise.all([
    loadGastos(),
    loadTurnoAbierto(),
    loadCategorias(),
  ]);

  return (
    <CajaShell rol={rol} active="gastos">
      <GastosPanel rol={rol} gastos={gastos} turnoAbierto={turnoAbierto} categorias={categorias} />
    </CajaShell>
  );
}
