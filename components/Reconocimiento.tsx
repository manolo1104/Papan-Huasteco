import { Icon } from "./Icons";

export default function Reconocimiento() {
  return (
    <section id="amlo" className="amlo" aria-labelledby="amlo-h2">
      <div className="amlo-inner reveal">
        <div className="amlo-visual">
          <div className="amlo-quote-mark" aria-hidden="true">
            &ldquo;
          </div>
          <div className="amlo-visual-inner">
            <blockquote className="amlo-quote">
              &quot;El mejor restaurante de la región. La atención es increíble, el sabor excepcional. Podría desayunar,
              comer y cenar en el mismo lugar.&quot;
            </blockquote>
            <div className="amlo-attr">Carlos A. · Visitante</div>
            <div className="amlo-deco" aria-hidden="true" />
          </div>
        </div>

        <div className="amlo-text">
          <h2 className="heading-md" id="amlo-h2">
            Una mesa que
            <br />
            ha recibido a todos
          </h2>
          <p className="body-text">
            El Papán Huasteco es reconocido como uno de los mejores restaurantes en Xilitla. Nuestras mesas han recibido
            a viajeros de todo el mundo, incluyendo al expresidente Andrés Manuel López Obrador, quien eligió desayunar
            con nosotros durante su visita a la región.
          </p>
          <p className="body-text" style={{ marginTop: "1rem" }}>
            Un honor que nos recuerda cada día por qué hacemos lo que hacemos: preparar una cocina honesta, con el mejor
            producto regional y el corazón puesto en cada platillo.
          </p>
          <div className="amlo-badge">
            <span className="amlo-badge-icon">
              <Icon name="award" />
            </span>
            <div className="amlo-badge-text">
              <strong>Premio a la Calidad</strong>
              Reconocido como uno de los mejores restaurantes de Xilitla
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
