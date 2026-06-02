import { SITE } from "@/lib/site";
import Magnetic from "./Magnetic";

export default function CtaFinal() {
  return (
    <section className="cta-final" aria-label="Llamado final a la acción">
      <div className="cta-bg" aria-hidden="true" />
      <div className="cta-content reveal">
        <h2 className="heading-lg" style={{ fontStyle: "italic", lineHeight: 1.1, marginBottom: "1rem" }}>
          Te esperamos con
          <br />
          hambre y buen café
        </h2>
        <p>
          A 5 minutos de Las Pozas, con la cocina huasteca más auténtica de la región. Reserva tu mesa o ven directo;
          abrimos todos los días.
        </p>
        <div className="cta-btns">
          <Magnetic>
            <a href="#reservar" className="btn btn--tierra">
              Reservar Mesa <span className="ar">→</span>
            </a>
          </Magnetic>
          <a href={SITE.mapsLink} target="_blank" rel="noopener noreferrer" className="btn btn--outline-light">
            Cómo Llegar
          </a>
        </div>
      </div>
    </section>
  );
}
