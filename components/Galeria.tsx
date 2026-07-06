"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const PHOTOS = [
  {
    src: "/images/terraza.jpg",
    alt: "Terraza al aire libre del restaurante El Papán Huasteco al amanecer, rodeada de vegetación tropical en Xilitla SLP",
    caption: "Nuestra terraza al amanecer",
  },
  {
    src: "/images/dishes/bocoles-rellenos.jpg",
    alt: "Bocoles rellenos de cecina con frijoles, queso y aguacate servidos en El Papán Huasteco, Xilitla",
    caption: "La mesa huasteca, servida",
  },
  {
    src: "/images/las-pozas.webp",
    alt: "Vista de la selva tropical de la Huasteca Potosina desde la terraza del restaurante El Papán Huasteco, Xilitla",
    caption: "La selva huasteca que nos rodea",
  },
  {
    src: "/images/cafe-de-olla-barro.jpg",
    alt: "Café de olla servido en taza de barro en el comedor de El Papán Huasteco, Xilitla",
    caption: "Café de olla en taza de barro",
  },
  {
    src: "/images/fogon-lena.jpg",
    alt: "Fogón de leña encendido frente al comedor de El Papán Huasteco, Xilitla",
    caption: "El fogón de leña, corazón de la cocina",
  },
  {
    src: "/images/dishes/bocoles-comal.jpg",
    alt: "Bocoles de masa de maíz dorándose sobre comal de barro en El Papán Huasteco, Xilitla",
    caption: "Bocoles en el comal de barro, como siempre se han hecho",
  },
];

export default function Galeria() {
  const [open, setOpen] = useState<number | null>(null);
  // Revelado controlado por estado de React (no por la clase imperativa del
  // observador global), para que un re-render del lightbox no lo borre.
  const [revealed, setRevealed] = useState(false);
  const mosaicRef = useRef<HTMLDivElement>(null);
  const srcRect = useRef<DOMRect | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // FLIP: la imagen del lightbox crece desde el tile que se tocó.
  useEffect(() => {
    if (open === null || !wrapRef.current || !srcRect.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = wrapRef.current.getBoundingClientRect();
    const s = srcRect.current;
    const dx = s.left + s.width / 2 - (target.left + target.width / 2);
    const dy = s.top + s.height / 2 - (target.top + target.height / 2);
    const sx = s.width / target.width;
    const sy = s.height / target.height;
    const anim = wrapRef.current.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, opacity: 0.7 },
        { transform: "translate(0, 0) scale(1, 1)", opacity: 1 },
      ],
      { duration: 420, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
    );
    return () => anim.cancel();
  }, [open]);

  useEffect(() => {
    const el = mosaicRef.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.body.style.overflow = open !== null ? "hidden" : "";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <section id="galeria" className="galeria" aria-labelledby="galeria-h2">
      <div className="galeria-header reveal">
        <div>
          <h2 className="heading-lg" id="galeria-h2">
            Un vistazo al Papán
          </h2>
        </div>
        <p className="body-sm" style={{ maxWidth: 360 }}>
          Ambiente, naturaleza y los platillos que preparamos cada día. Haz clic en cualquier imagen para verla en
          grande.
        </p>
      </div>

      <div className={`galeria-mosaic${revealed ? " is-in" : ""}`} ref={mosaicRef}>
        {PHOTOS.map((p, i) => (
          <button
            className="gal"
            key={p.src}
            onClick={(e) => {
              srcRect.current = e.currentTarget.getBoundingClientRect();
              setOpen(i);
            }}
            aria-label={`Ampliar imagen: ${p.caption}`}
          >
            <Image src={p.src} alt={p.alt} fill sizes="(max-width: 768px) 50vw, 33vw" style={{ objectFit: "cover" }} />
            <div className="gal-caption">
              <span className="gal-caption-text">{p.caption}</span>
              <span className="gal-zoom" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
                </svg>
              </span>
            </div>
          </button>
        ))}
      </div>

      <div
        className={`lightbox${open !== null ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Imagen ampliada"
        onClick={() => setOpen(null)}
      >
        <button className="lightbox-close" aria-label="Cerrar imagen" onClick={() => setOpen(null)}>
          ✕
        </button>
        {open !== null && (
          <div className="lightbox-img-wrap" ref={wrapRef} onClick={(e) => e.stopPropagation()}>
            <Image
              src={PHOTOS[open].src}
              alt={PHOTOS[open].alt}
              width={1400}
              height={1000}
              sizes="92vw"
              style={{ width: "auto", height: "auto", maxWidth: "92vw", maxHeight: "88vh", objectFit: "contain" }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
