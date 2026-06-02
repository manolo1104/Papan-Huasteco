import Image from "next/image";
import CountUp from "./CountUp";
import Magnetic from "./Magnetic";

const LEAVES = [
  { left: "7%", w: 12, dur: "15s", delay: "0s" },
  { left: "19%", w: 9, dur: "19s", delay: "3s" },
  { left: "33%", w: 15, dur: "13s", delay: "6s" },
  { left: "48%", w: 8, dur: "21s", delay: "1.5s" },
  { left: "63%", w: 13, dur: "16s", delay: "8s" },
  { left: "78%", w: 10, dur: "18s", delay: "4.5s" },
  { left: "90%", w: 14, dur: "14s", delay: "10s" },
];

export default function Hero() {
  return (
    <section id="inicio" className="hero" aria-label="Restaurante El Papán Huasteco, Inicio">
      <div className="hero-bg">
        <Image
          className="hero-bg-img"
          src="/images/hero-bg.jpg"
          alt="Platillos tradicionales de la Huasteca Potosina servidos en el restaurante El Papán Huasteco, Xilitla"
          fill
          priority
          sizes="100vw"
        />
      </div>

      <div className="hero-leaves" aria-hidden="true">
        {LEAVES.map((l, i) => (
          <span
            key={i}
            className="leaf"
            style={{ left: l.left, width: l.w, animationDuration: l.dur, animationDelay: l.delay }}
          />
        ))}
      </div>

      <div className="hero-content">
        <div className="hero-left">
          <div className="hero-tag">
            <span className="hero-tag-dot" aria-hidden="true" />
            Xilitla · San Luis Potosí · México
          </div>

          <h1 className="hero-h1">
            <span className="h1-line">
              <span>Cocina Huasteca</span>
            </span>
            <span className="h1-line">
              <span>
                <em>de Verdad</em>
              </span>
            </span>
          </h1>

          <p className="hero-desc">
            Ingredientes frescos de la región, recetas de tradición y el ambiente único de la selva huasteca. A minutos
            del Castillo de Edward James en Xilitla.
          </p>

          <div className="hero-btns">
            <a href="#menu-section" className="btn btn--outline-light" aria-label="Ver el menú completo">
              Ver el Menú
            </a>
            <Magnetic>
              <a href="#reservar" className="btn btn--tierra" aria-label="Ir a reservar mesa">
                Reservar Mesa <span className="ar">→</span>
              </a>
            </Magnetic>
          </div>
        </div>

        <div className="hero-stats" aria-label="Datos del restaurante">
          <div className="hero-stat-item">
            <div className="hero-stat-num">
              <CountUp value={4.9} decimals={1} />
            </div>
            <div className="hero-stat-lbl">★★★★★ Google</div>
          </div>
          <div className="hero-stat-item">
            <div className="hero-stat-num">
              <CountUp value={5} suffix="'" />
            </div>
            <div className="hero-stat-lbl">del Castillo</div>
          </div>
          <div className="hero-stat-item">
            <div className="hero-stat-num">
              <CountUp value={1} prefix="#" />
            </div>
            <div className="hero-stat-lbl">en Xilitla</div>
          </div>
        </div>
      </div>

      <div className="hero-scroll-hint" aria-hidden="true">
        <span>Scroll</span>
        <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
          <path d="M6 1v16M1 12l5 5 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    </section>
  );
}
