import { getRol } from "@/lib/caja/auth";
import {
  loadTurnos,
  loadTurnoAbierto,
  loadGastosDeTurno,
  loadGastosSinLigar,
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
  const [gastosTurno, gastosSinLigar] = turnoAbierto
    ? await Promise.all([
        loadGastosDeTurno(turnoAbierto.id),
        loadGastosSinLigar(turnoAbierto.fecha),
      ])
    : [[], []];

  return (
    <CajaShell rol={rol} active="turnos">
      <TurnosPanel
        rol={rol}
        turnos={turnos}
        turnoAbierto={turnoAbierto}
        gastosTurno={gastosTurno}
        gastosSinLigar={gastosSinLigar}
      />
    </CajaShell>
  );
}
