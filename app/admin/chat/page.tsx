import { redirect } from "next/navigation";
import { getRol } from "@/lib/caja/auth";
import CajaLogin from "@/components/caja/CajaLogin";
import CajaShell from "@/components/caja/CajaShell";
import ChatPanel from "@/components/caja/ChatPanel";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const rol = await getRol();
  if (!rol) return <CajaLogin />;
  // El asistente es para el dueño y la encargada (ven todos los números).
  if (rol === "mesero") redirect("/admin/pos");
  if (rol === "cocina") redirect("/admin/cocina");

  return (
    <CajaShell rol={rol} active="chat">
      <ChatPanel />
    </CajaShell>
  );
}
