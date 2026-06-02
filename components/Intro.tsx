import Image from "next/image";

export default function Intro() {
  return (
    <section id="nosotros" className="intro" aria-labelledby="nosotros-h2">
      <div className="intro-grid">
        <div className="intro-visual reveal reveal-left">
          <div className="intro-img-main">
            <Image
              src="/images/terraza.jpg"
              alt="Terraza al aire libre del restaurante El Papán Huasteco rodeada de vegetación tropical en Xilitla, San Luis Potosí"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="intro-img-float" role="img" aria-label="Café del restaurante El Papán Huasteco">
            <Image
              src="/images/cafe.jpg"
              alt="Café de olla del restaurante El Papán Huasteco, Xilitla"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              style={{ objectFit: "cover" }}
            />
            <div className="steam" aria-hidden="true">
              <span className="steam-p" />
              <span className="steam-p" />
              <span className="steam-p" />
            </div>
          </div>
        </div>

        <div className="intro-text-wrap">
          <h2 className="heading-lg reveal-clip" id="nosotros-h2">
            El sabor que
            <br />
            hace regresar
            <br />a Xilitla
          </h2>

          <blockquote className="intro-pull reveal reveal-delay-2">
            &quot;Todos nuestros platillos son preparados con ingredientes frescos de la región y al momento, por lo que
            podrás disfrutar de un sazón 100% casero.&quot;
          </blockquote>

          <p className="body-text reveal reveal-delay-3">
            El Papán Huasteco nació con una misión sencilla: que cada persona que llega a Xilitla se lleve consigo el
            auténtico sabor de la Huasteca Potosina. Somos parte del Hotel Paraíso Encantado, rodeados de selva
            tropical, a solo pasos del mítico Castillo de Edward James. Aquí, la naturaleza y la cocina se encuentran en
            cada plato.
          </p>

          <div className="intro-features reveal reveal-delay-4">
            <div className="intro-feat">
              <svg className="intro-feat-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 14s-6-4.5-6-8.5a6 6 0 0112 0C14 9.5 8 14 8 14z" />
                <circle cx="8" cy="5.5" r="1.8" />
              </svg>
              <p>
                <strong>Xilitla, SLP</strong>
                <br />
                En el corazón de la Huasteca
              </p>
            </div>
            <div className="intro-feat">
              <svg className="intro-feat-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3l2 2" />
              </svg>
              <p>
                <strong>7:30 AM - 9:00 PM</strong>
                <br />
                Todos los días del año
              </p>
            </div>
            <div className="intro-feat">
              <svg className="intro-feat-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 13V6l5-4 5 4v7M6 13V9h4v4" />
              </svg>
              <p>
                <strong>Estacionamiento</strong>
                <br />
                Propio y sin costo
              </p>
            </div>
            <div className="intro-feat">
              <svg className="intro-feat-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2l1.8 3.6L14 6.5l-3 2.9.7 4.1L8 11.5l-3.7 1.9.7-4.1L2 6.5l4.2-.9z" />
              </svg>
              <p>
                <strong>4.9 / 5 estrellas</strong>
                <br />
                Más de 87 reseñas reales
              </p>
            </div>
          </div>

          <div style={{ marginTop: "2.5rem" }} className="reveal">
            <a href="#menu-section" className="btn btn--outline" aria-label="Explorar el menú">
              Explorar el Menú →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
