import { getRol } from "@/lib/caja/auth";
import {
  loadTurnos,
  loadTurnoAbierto,
  sumaGastosEfectivoTurno,
} from "@/lib/caja/data";
import CajaLogin from "@/components/caja/CajaLogin";
import CajaShell from "@/components/caja/CajaShell";
import TurnosPanel from "@/components/caja/TurnosPanel";

export const dynamic = "force-dynamic";

export default async function TurnosPage() {
  const rol = await getRol();
  if (!rol) return <CajaLogin />;

  const [turnos, turnoAbierto] = await Promise.all([
    loadTurnos(),
    loadTurnoAbierto(),
  ]);
  const gastosEfectivoAbierto = turnoAbierto
    ? await sumaGastosEfectivoTurno(turnoAbierto.id)
    : 0;

  return (
    <CajaShell rol={rol} active="turnos">
      <TurnosPanel
        rol={rol}
        turnos={turnos}
        turnoAbierto={turnoAbierto}
        gastosEfectivoAbierto={gastosEfectivoAbierto}
      />
    </CajaShell>
  );
}
