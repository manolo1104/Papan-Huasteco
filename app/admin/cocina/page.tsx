import { getRol } from "@/lib/caja/auth";
import { loadCocina } from "@/lib/caja/data";
import CajaLogin from "@/components/caja/CajaLogin";
import CajaShell from "@/components/caja/CajaShell";
import CocinaPanel from "@/components/caja/CocinaPanel";

export const dynamic = "force-dynamic";

export default async function CocinaPage() {
  const rol = await getRol();
  if (!rol) return <CajaLogin />;
  const comandas = await loadCocina();
  return (
    <CajaShell rol={rol} active="cocina">
      <CocinaPanel inicial={comandas} />
    </CajaShell>
  );
}
