import Image from "next/image";
import { SITE } from "@/lib/site";
import { Icon } from "./Icons";

const AMENITIES = [
  { icon: "car", text: "Estacionamiento propio" },
  { icon: "leaf", text: "Terraza al aire libre" },
  { icon: "paw", text: "Pet-friendly" },
  { icon: "wifi", text: "WiFi disponible" },
  { icon: "card", text: "Efectivo y tarjeta" },
  { icon: "bed", text: "Hotel incluido" },
];

export default function Info() {
  return (
    <section id="info" className="info" aria-labelledby="info-h2">
      <div className="info-grid">
        <div>
          <div className="info-logo">
            <Image src="/images/logo.png" alt="El Papán Huasteco" fill sizes="160px" />
          </div>
          <h2 className="heading-md reveal" id="info-h2">
            Visítanos en
            <br />
            Xilitla
          </h2>
          <p className="info-tagline">Restaurante de cocina huasteca dentro del Hotel Paraíso Encantado.</p>

          <div className="info-contact-list">
            <div className="info-contact-item">
              <span className="info-contact-icon">
                <Icon name="pin" />
              </span>
              <div>
                <div className="info-contact-lbl">Dirección</div>
                <div className="info-contact-val">{SITE.address.full}</div>
              </div>
            </div>
            <div className="info-contact-item">
              <span className="info-contact-icon">
                <Icon name="phone" />
              </span>
              <div>
                <div className="info-contact-lbl">Teléfono</div>
                <div className="info-contact-val">
                  <a href={SITE.phoneTel}>{SITE.phoneDisplay}</a>
                </div>
              </div>
            </div>
            <div className="info-contact-item">
              <span className="info-contact-icon">
                <Icon name="chat" />
              </span>
              <div>
                <div className="info-contact-lbl">WhatsApp</div>
                <div className="info-contact-val">
                  <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
                    Escríbenos ahora →
                  </a>
                </div>
              </div>
            </div>
            <div className="info-contact-item">
              <span className="info-contact-icon">
                <Icon name="globe" />
              </span>
              <div>
                <div className="info-contact-lbl">Web</div>
                <div className="info-contact-val">papan-huasteco.vercel.app</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="info-col-h">Horarios</div>
          <div className="hours-list">
            <div className="hours-row">
              <span className="hours-day">Lunes a Domingo</span>
              <span className="hours-time">{SITE.hours}</span>
            </div>
          </div>
          <p className="info-contact-val" style={{ marginTop: "1rem", color: "rgba(255,255,255,0.5)" }}>
            Abierto todos los días del año
          </p>

          <div className="info-col-h" style={{ marginTop: "2.5rem" }}>
            Amenidades
          </div>
          <div className="amenities-grid">
            {AMENITIES.map((a) => (
              <div className="amenity" key={a.text}>
                <span className="amenity-icon">
                  <Icon name={a.icon} />
                </span>
                {a.text}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="info-col-h">Cómo Llegar</div>
          <div className="map-card">
            <iframe
              src={SITE.mapsEmbed}
              title="Mapa de El Papán Huasteco en Xilitla"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="map-card-footer">
              <div className="map-card-addr">
                <strong>El Papán Huasteco</strong>
                <br />
                Camino a Las Pozas 10, La Conchita
              </div>
              <a className="map-card-link" href={SITE.mapsLink} target="_blank" rel="noopener noreferrer">
                Abrir mapa →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
