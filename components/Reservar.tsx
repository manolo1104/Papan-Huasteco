"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import { track } from "@/lib/analytics";
import { WhatsAppIcon } from "./Icons";

export default function Reservar() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const form = e.currentTarget;
    const data = new FormData(form);
    data.append("_subject", "Nueva solicitud de reserva · El Papán Huasteco");
    data.append("_captcha", "false");
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${SITE.email}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      if (!res.ok) throw new Error("error");
      setSent(true);
      track("reservar_enviada", { method: "formulario" });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="reservar" className="reservar" aria-labelledby="reservar-h2">
      <div className="reservar-grid">
        <div className="reservar-intro reveal">
          <span className="label">Reserva tu mesa</span>
          <h2 className="heading-lg" id="reservar-h2" style={{ marginTop: "0.6rem" }}>
            Aparta tu lugar
            <br />
            en el Papán
          </h2>
          <p className="body-text" style={{ marginTop: "1.2rem" }}>
            No es obligatoria, pero la recomendamos para grupos, celebraciones o fines de semana. Déjanos tus datos y te
            confirmamos muy pronto, o escríbenos directo por WhatsApp.
          </p>
          <div style={{ marginTop: "1.8rem" }}>
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--filled"
              aria-label="Reservar por WhatsApp"
              data-evt="whatsapp_reservar"
            >
              <WhatsAppIcon style={{ width: "1.05em", height: "1.05em" }} /> Reservar por WhatsApp
            </a>
          </div>
          <ul className="reservar-trust" aria-label="Por qué reservar con confianza">
            <li>Te confirmamos el mismo día</li>
            <li>Sin costo ni anticipo</li>
            <li>Estacionamiento propio gratis</li>
          </ul>
        </div>

        <div className="reservar-form-wrap">
          {sent ? (
            <div className="reservar-ok" role="status">
              <div className="reservar-ok-icon" aria-hidden="true">
                ✓
              </div>
              <h3>¡Solicitud enviada!</h3>
              <p>Gracias. Recibimos tu solicitud de reserva y te confirmaremos muy pronto.</p>
            </div>
          ) : (
            <form className="reservar-form" onSubmit={handleSubmit}>
              <div className="form-row form-row--2">
                <label className="form-field">
                  <input type="text" name="Nombre" required placeholder=" " />
                  <span>Nombre *</span>
                </label>
                <label className="form-field">
                  <input type="tel" name="Teléfono" required placeholder=" " />
                  <span>Teléfono *</span>
                </label>
              </div>
              <div className="form-row form-row--2">
                <label className="form-field">
                  <input type="number" name="Personas" min={1} required placeholder=" " />
                  <span>Personas *</span>
                </label>
                <label className="form-field">
                  <input type="text" name="Fecha y hora" placeholder=" " />
                  <span>Fecha y hora</span>
                </label>
              </div>
              <div className="form-row">
                <label className="form-field">
                  <textarea name="Comentario" rows={3} placeholder=" " />
                  <span>Comentario (cumpleaños, alergias…)</span>
                </label>
              </div>
              <div className="form-row">
                <button type="submit" className="btn btn--tierra" disabled={loading} style={{ width: "100%", justifyContent: "center" }} data-evt="reservar_submit">
                  {loading ? (
                    <>
                      <span className="btn-spinner" aria-hidden="true" /> Enviando…
                    </>
                  ) : (
                    <>
                      Enviar solicitud <span className="ar">→</span>
                    </>
                  )}
                </button>
                <p className="reservar-legal" style={{ textAlign: "center", marginTop: "0.1rem" }}>
                  Respuesta el mismo día. Solo usamos tus datos para confirmar tu mesa.
                </p>
              </div>
              {error && (
                <p className="reservar-legal" style={{ color: "var(--terracota)" }}>
                  No se pudo enviar. Por favor escríbenos por{" "}
                  <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                  .
                </p>
              )}
              <p className="reservar-legal">
                Al enviar aceptas nuestro{" "}
                <a href="/privacidad">Aviso de Privacidad</a>. Usaremos tus datos solo para confirmar tu reserva.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
