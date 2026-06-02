import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Dónde comer cerca de Las Pozas (Castillo de Edward James)",
  description:
    "El Papán Huasteco está a 5 minutos caminando de Las Pozas, el Castillo de Edward James en Xilitla. Cocina huasteca, estacionamiento propio y terraza en la selva. La parada perfecta antes o después de tu visita.",
  alternates: { canonical: "/las-pozas" },
  openGraph: {
    type: "website",
    title: "Dónde comer cerca de Las Pozas en Xilitla · El Papán Huasteco",
    description:
      "Restaurante de cocina huasteca a 5 minutos del Castillo de Edward James, con estacionamiento propio y terraza en la selva.",
    images: ["/images/las-pozas.webp"],
  },
};

export default function LasPozasPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Inicio", url: SITE.url },
    { name: "Cerca de Las Pozas", url: `${SITE.url}/las-pozas` },
  ]);
  return (
    <div className="subpage">
      <JsonLd data={{ "@context": "https://schema.org", ...breadcrumb }} />

      <article className="legal" style={{ maxWidth: 820 }}>
        <p className="article-meta">Xilitla, Huasteca Potosina</p>
        <h1>Dónde comer cerca de Las Pozas</h1>

        <div className="lp-cover">
          <Image
            src="/images/las-pozas.webp"
            alt="Las Pozas de Xilitla, el Castillo de Edward James, rodeado de selva; El Papán Huasteco está a 5 minutos caminando"
            fill
            sizes="(max-width: 860px) 100vw, 820px"
            priority
            style={{ objectFit: "cover" }}
          />
        </div>

        <p>
          <strong>El Papán Huasteco está a solo 5 minutos caminando del Castillo de Edward James (Las Pozas)</strong>, en
          Camino La Conchita – Las Pozas Núm. 10, Xilitla, San Luis Potosí. Si vas a visitar el jardín surrealista más
          famoso de la Huasteca, somos la parada ideal para desayunar antes o comer al terminar el recorrido, con
          estacionamiento propio sin costo y una terraza al aire libre rodeada de selva.
        </p>

        <h2>Cómo llegar desde Las Pozas</h2>
        <p>
          Estamos sobre el mismo camino La Conchita – Las Pozas, a unos 5 minutos a pie de la entrada del recinto. Si
          llegas en auto desde el centro de Xilitla son apenas unos minutos. Tenemos estacionamiento propio, así que no
          tienes que buscar dónde dejar el coche.
        </p>

        <div className="map-card" style={{ margin: "1.5rem 0" }}>
          <iframe
            src={SITE.mapsEmbed}
            title="Mapa de El Papán Huasteco, cerca de Las Pozas en Xilitla"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ filter: "none" }}
          />
        </div>

        <h2>Qué encontrarás</h2>
        <ul>
          <li>
            <strong>Cocina huasteca auténtica:</strong> enchiladas huastecas, huevos ahogados en cazuela de barro,
            bocoles, cecina, arrachera, mariscos y café de olla.
          </li>
          <li>
            <strong>Horario amplio:</strong> abierto todos los días de 7:30 AM a 9:00 PM (desayuno, comida y cena).
          </li>
          <li>
            <strong>Comodidad:</strong> estacionamiento propio gratis, terraza al aire libre, pet-friendly, WiFi y pago
            con tarjeta o efectivo.
          </li>
          <li>
            <strong>Reputación:</strong> 4.9 / 5 con más de 87 reseñas; reconocido entre los mejores restaurantes de
            Xilitla.
          </li>
        </ul>

        <h2>Antes o después de Las Pozas</h2>
        <p>
          Recomendamos desayunar fuerte antes de entrar a Las Pozas (el recorrido toma 2 a 3 horas y hay muchas
          escaleras) y reservar una comida tranquila para cuando salgas. Si quieres asegurar tu mesa, sobre todo en
          fines de semana y puentes, reserva con anticipación.
        </p>

        <div className="menupage-cta" style={{ marginTop: "2rem" }}>
          <Link href="/#reservar" className="btn btn--tierra">
            Reservar mesa
          </Link>
          <Link href="/menu" className="btn btn--outline">
            Ver el menú
          </Link>
          <a href={SITE.mapsLink} target="_blank" rel="noopener noreferrer" className="btn btn--ghost" data-evt="como_llegar">
            Cómo llegar
          </a>
        </div>

        <p style={{ marginTop: "2rem" }}>
          ¿Planeando tu visita? Lee también nuestra{" "}
          <Link href="/blog/visitar-las-pozas-xilitla">guía para visitar Las Pozas</Link> y{" "}
          <Link href="/blog/que-hacer-en-xilitla">qué hacer en Xilitla en 2 días</Link>.
        </p>
      </article>
    </div>
  );
}
