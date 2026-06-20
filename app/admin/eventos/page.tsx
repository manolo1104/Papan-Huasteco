import { getRol } from "@/lib/caja/auth";
import { loadEventos } from "@/lib/caja/data";
import CajaLogin from "@/components/caja/CajaLogin";
import CajaShell from "@/components/caja/CajaShell";
import EventosPanel from "@/components/caja/EventosPanel";

export const dynamic = "force-dynamic";

export default async function EventosPage() {
  const rol = await getRol();
  if (!rol) return <CajaLogin />;
  const eventos = await loadEventos();
  return (
    <CajaShell rol={rol} active="eventos">
      <EventosPanel rol={rol} eventos={eventos} />
    </CajaShell>
  );
}
