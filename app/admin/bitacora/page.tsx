import { redirect } from "next/navigation";
import { getRol } from "@/lib/caja/auth";
import { loadBitacora } from "@/lib/caja/data";
import CajaLogin from "@/components/caja/CajaLogin";
import CajaShell from "@/components/caja/CajaShell";
import BitacoraPanel from "@/components/caja/BitacoraPanel";

export const dynamic = "force-dynamic";

export default async function BitacoraPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const rol = await getRol();
  if (!rol) return <CajaLogin />;
  if (rol !== "admin") redirect("/admin");

  const fecha = typeof searchParams.fecha === "string" ? searchParams.fecha : "";
  const accion = typeof searchParams.accion === "string" ? searchParams.accion : "";

  const movimientos = await loadBitacora({
    fecha: fecha || undefined,
    accion: accion || undefined,
  });

  return (
    <CajaShell rol={rol} active="bitacora">
      <BitacoraPanel movimientos={movimientos} fecha={fecha} accion={accion} />
    </CajaShell>
  );
}
