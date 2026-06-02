"use client";

import Script from "next/script";
import { useEffect } from "react";

// Google Analytics 4. Inactivo hasta definir NEXT_PUBLIC_GA_ID en el entorno.
// Registra automáticamente clics en cualquier elemento con [data-evt] (WhatsApp,
// reservar, menú PDF, cómo llegar) como eventos de conversión.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function Analytics() {
  useEffect(() => {
    if (!GA_ID) return;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-evt]");
      if (el && typeof window.gtag === "function") {
        window.gtag("event", el.dataset.evt as string, { transport_type: "beacon" });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
