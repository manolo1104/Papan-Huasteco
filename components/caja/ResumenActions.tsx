"use client";

import { Icon } from "@/components/caja/ui/Icon";

export default function ResumenActions({ texto }: { texto: string }) {
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  return (
    <div className="caja-reportes__actions caja-noprint">
      <a
        className="caja-btn caja-btn--primary caja-btn--sm"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon name="whatsapp" size={15} /> Compartir por WhatsApp
      </a>
      <button
        className="caja-btn caja-btn--ghost caja-btn--sm"
        onClick={() => window.print()}
      >
        <Icon name="imprimir" size={15} /> Imprimir / PDF
      </button>
    </div>
  );
}
