"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { WhatsAppIcon } from "./Icons";

// Barra de acción fija en móvil (alto impacto en conversión): Reservar + WhatsApp.
// Aparece al pasar el hero. En escritorio no se muestra (el nav ya tiene "Reservar").
export default function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      setShow(window.scrollY > 520);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`sticky-cta${show ? " show" : ""}`} aria-hidden={!show}>
      <a href="/#reservar" className="btn btn--tierra" data-evt="reservar_sticky">
        Reservar mesa
      </a>
      <a
        href={SITE.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="btn sticky-cta-wa"
        data-evt="whatsapp_sticky"
        aria-label="Escríbenos por WhatsApp"
      >
        <WhatsAppIcon style={{ width: "1.1em", height: "1.1em" }} /> WhatsApp
      </a>
    </div>
  );
}
