import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Aviso de Privacidad",
  description: "Aviso de Privacidad de El Papán Huasteco conforme a la LFPDPPP.",
  alternates: { canonical: "/privacidad" },
  robots: { index: false, follow: true },
};

export default function Privacidad() {
  return (
    <div className="subpage">
      <article className="legal">
        <h1>Aviso de Privacidad</h1>
        <p style={{ color: "var(--gris-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.78rem" }}>
          Última actualización: 29 de mayo de 2026
        </p>
        <p>
          En cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP),
          su Reglamento y demás disposiciones aplicables, ponemos a su disposición el presente Aviso de Privacidad.
        </p>

        <h2>1. Identidad y domicilio del responsable</h2>
        <p>
          <strong>El Papán Huasteco</strong> (Hotel Paraíso Encantado).
          <br />
          {SITE.address.full}, México.
          <br />
          Teléfono: {SITE.phoneDisplay} · Correo: {SITE.email}
        </p>
        <p>
          Es responsable del tratamiento y protección de los datos personales que usted nos proporcione, conforme a lo
          establecido en este aviso.
        </p>

        <h2>2. Datos personales que recabamos</h2>
        <p>Para las finalidades descritas, podemos recabar los siguientes datos personales:</p>
        <ul>
          <li>Nombre completo.</li>
          <li>Número de teléfono.</li>
          <li>Correo electrónico.</li>
          <li>Datos de su solicitud de reserva (fecha, hora, número de personas y comentarios).</li>
        </ul>
        <p>
          No recabamos datos personales sensibles. La información se obtiene cuando usted completa voluntariamente
          nuestro formulario de reserva o nos contacta por teléfono o WhatsApp.
        </p>

        <h2>3. Finalidades del tratamiento</h2>
        <p>
          <strong>Finalidades primarias</strong> (necesarias para el servicio):
        </p>
        <ul>
          <li>Gestionar, confirmar y dar seguimiento a sus reservas.</li>
          <li>Atender sus dudas, comentarios o solicitudes de contacto.</li>
          <li>Brindarle el servicio de restaurante solicitado.</li>
        </ul>
        <p>
          <strong>Finalidades secundarias</strong> (opcionales):
        </p>
        <ul>
          <li>Enviarle información sobre promociones, eventos o novedades del restaurante.</li>
        </ul>
        <p>
          Si no desea que sus datos se utilicen para las finalidades secundarias, puede manifestarlo enviando un correo
          a {SITE.email}. Su negativa no será motivo para negarle el servicio solicitado.
        </p>

        <h2>4. Derechos ARCO</h2>
        <p>
          Usted tiene derecho a Acceder, Rectificar y Cancelar sus datos personales, así como a Oponerse a su
          tratamiento o a revocar el consentimiento otorgado (derechos ARCO). Para ejercer cualquiera de estos derechos,
          envíe su solicitud al correo {SITE.email}, indicando:
        </p>
        <ul>
          <li>Su nombre y un medio para comunicarle la respuesta.</li>
          <li>La descripción clara de los datos y el derecho que desea ejercer.</li>
          <li>Cualquier documento que facilite la localización de sus datos.</li>
        </ul>
        <p>Daremos respuesta a su solicitud en los plazos que marca la ley.</p>

        <h2>5. Transferencia de datos</h2>
        <p>
          Sus datos personales no serán transferidos ni compartidos con terceros con fines comerciales. Únicamente
          podrán ser tratados por proveedores de servicios necesarios para la operación (por ejemplo, el servicio de
          correo mediante el cual recibimos su formulario), quienes están obligados a mantener la confidencialidad de la
          información.
        </p>

        <h2>6. Uso de cookies y tecnologías de rastreo</h2>
        <p>
          Nuestro sitio web actualmente no utiliza cookies de seguimiento. En caso de incorporar herramientas de
          analítica web a futuro, este aviso será actualizado para informarle sobre los datos recabados y su finalidad.
        </p>

        <h2>7. Cambios al Aviso de Privacidad</h2>
        <p>
          Nos reservamos el derecho de modificar el presente Aviso de Privacidad para atender novedades legislativas o
          cambios en nuestras prácticas. Cualquier modificación se publicará en esta misma página, indicando la fecha de
          la última actualización.
        </p>
        <p>
          <a href="/">← Volver a El Papán Huasteco</a>
        </p>
      </article>
    </div>
  );
}
