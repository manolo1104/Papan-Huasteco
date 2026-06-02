"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { MENU } from "@/lib/menu";
import { SITE } from "@/lib/site";
import { Icon } from "./Icons";

function splitTwo<T>(arr: T[]): [T[], T[]] {
  const mid = Math.ceil(arr.length / 2);
  return [arr.slice(0, mid), arr.slice(mid)];
}

export default function Menu() {
  const [active, setActive] = useState(MENU[0].id);
  const barRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el = tabRefs.current[active];
    const bar = barRef.current;
    if (el && bar) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [active]);

  const cat = MENU.find((c) => c.id === active)!;
  const [colA, colB] = splitTwo(cat.items);

  return (
    <section id="menu-section" className="menu-highlight" aria-labelledby="menu-h2">
      <div className="menu-hl-header reveal">
        <div>
          <span className="label">Nuestra Carta</span>
          <h2 className="heading-lg" id="menu-h2" style={{ marginTop: "0.6rem" }}>
            El menú del
            <br />
            Papán Huasteco
          </h2>
        </div>
        <div>
          <p className="body-sm" style={{ maxWidth: 380, marginBottom: "1.5rem" }}>
            Todo preparado al momento. Agradecemos tu paciencia: cada platillo merece el tiempo que necesita.
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <a href="/menu" className="btn btn--outline" aria-label="Ver la carta completa">
              Ver carta completa →
            </a>
            <a
              href={SITE.menuPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--ghost"
              aria-label="Descargar el menú completo en PDF"
              data-evt="menu_pdf"
            >
              ↓ PDF
            </a>
          </div>
        </div>
      </div>

      <div className="menu-tabs-bar" role="tablist" ref={barRef}>
        {MENU.map((c) => (
          <button
            key={c.id}
            ref={(el) => {
              tabRefs.current[c.id] = el;
            }}
            className={`menu-tab${active === c.id ? " active" : ""}`}
            role="tab"
            aria-selected={active === c.id}
            onClick={() => setActive(c.id)}
          >
            {c.label}
          </button>
        ))}
        <span
          className="menu-tab-indicator"
          aria-hidden="true"
          style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
        />
      </div>

      <div className="menu-content">
        <div className="menu-panel" id={`tab-${cat.id}`} role="tabpanel" key={cat.id}>
          {cat.featured && (
            <div className="menu-featured">
              <div className="menu-feat-left">
                <div className="menu-feat-badge">
                  <Icon name={cat.featured.icon} /> {cat.featured.badge}
                </div>
                <div className="menu-feat-name">{cat.featured.name}</div>
                <div className="menu-feat-desc">{cat.featured.desc}</div>
              </div>
              <div className="menu-feat-price">{cat.featured.price}</div>
            </div>
          )}
          <div className="menu-two-col">
            {[colA, colB].map((col, ci) => (
              <div key={ci}>
                {col.map((item) => (
                  <div className="menu-row" key={item.name}>
                    <div className="menu-row-left">
                      <div className="menu-row-name">{item.name}</div>
                      {item.desc && <div className="menu-row-desc">{item.desc}</div>}
                    </div>
                    <div className="menu-row-price">{item.price}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="menu-cta-row reveal">
          <p className="menu-note">
            Precios en pesos mexicanos · Sujeto a disponibilidad · Todo preparado al momento
          </p>
          <a href="#reservar" className="btn btn--filled" aria-label="Reservar mesa">
            Reservar Mesa →
          </a>
        </div>
      </div>
    </section>
  );
}
