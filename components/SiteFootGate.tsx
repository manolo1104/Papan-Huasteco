"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import WhatsAppFloat from "./WhatsAppFloat";
import StickyCta from "./StickyCta";

// Footer + botones flotantes del sitio público; se ocultan en el panel /admin.
export default function SiteFootGate() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <>
      <Footer />
      <WhatsAppFloat />
      <StickyCta />
    </>
  );
}
