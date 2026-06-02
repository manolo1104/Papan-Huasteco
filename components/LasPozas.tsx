import Image from "next/image";
import { SITE } from "@/lib/site";
import CountUp from "./CountUp";

export default function LasPozas() {
  return (
    <section id="laspozas" className="laspozas" aria-labelledby="laspozas-h2">
      <div className="laspozas-grid">
        <div className="laspozas-text">
          <span className="label reveal">Ubicación Estratégica</span>
          <h2 className="heading-lg reveal-clip reveal-delay-1" id="laspozas-h2">
            La parada perfecta
            <br />
            antes de Las Pozas
          </h2>
          <p className="body-text reveal reveal-delay-2">
            El Castillo de Edward James, las míticas Las Pozas, es uno de los lugares más extraordinarios del mundo.
            Nosotros estamos a solo minutos caminando. Recarga energías con nosotros antes de explorar, o celebra tu
            visita con un desayuno o comida memorable después.
          </p>

          <div className="laspozas-distance reveal reveal-delay-2">
            <div className="laspozas-dist-num">
              <CountUp value={5} suffix="'" />
            </div>
            <div className="laspozas-dist-text">
              <strong>caminando al Castillo de Edward James</strong>
              <span>{SITE.address.full}</span>
            </div>
          </div>

          <div className="laspozas-perks reveal reveal-delay-3">
            <div className="laspozas-perk">
              <div className="laspozas-perk-dot" aria-hidden="true" />
              <p className="laspozas-perk-text">
                Estacionamiento propio disponible: llega directo sin buscar dónde dejar tu auto
              </p>
            </div>
            <div className="laspozas-perk">
              <div className="laspozas-perk-dot" aria-hidden="true" />
              <p className="laspozas-perk-text">
                Ideal como desayuno antes de la visita o comida de celebración al terminar
              </p>
            </div>
            <div className="laspozas-perk">
              <div className="laspozas-perk-dot" aria-hidden="true" />
              <p className="laspozas-perk-text">
                Zona de naturaleza y tranquilidad, sin el bullicio del centro de Xilitla
              </p>
            </div>
          </div>

          <div style={{ marginTop: "2rem" }} className="reveal">
            <a href="/las-pozas" className="btn btn--outline" aria-label="Cómo llegar y más sobre Las Pozas">
              Cómo llegar y más →
            </a>
          </div>
        </div>

        <div className="laspozas-visual reveal reveal-right">
          <div className="laspozas-main-img">
            <div className="lp-parallax" data-parallax="0.06">
              <Image
                src="/images/las-pozas.webp"
                alt="Las Pozas de Xilitla, el surrealista Castillo de Edward James, San Luis Potosí"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
          <div className="laspozas-overlay-card">
            <span className="laspozas-oc-num">5&apos;</span>
            <p className="laspozas-oc-text">
              <strong>A pasos del Castillo de Edward James.</strong> La parada obligada de tu visita a la Huasteca
              Potosina.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
