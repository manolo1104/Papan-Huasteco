import type { Metadata } from "next";
import Link from "next/link";
import ArticleShell from "@/components/ArticleShell";
import { getPost } from "@/lib/blog";

const post = getPost("que-hacer-en-xilitla")!;

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: { type: "article", title: post.title, description: post.description, images: [post.cover] },
};

export default function Page() {
  return (
    <ArticleShell
      post={post}
      ctaTitle="Haz de El Papán tu parada en Xilitla"
      ctaText="A minutos de Las Pozas, con la mejor cocina huasteca. Reserva tu mesa."
    >
      <p>
        <strong>Xilitla</strong>, en la sierra de San Luis Potosí, es uno de los Pueblos Mágicos más especiales de
        México: selva, niebla, café, arte surrealista y la calidez de la Huasteca. Si tienes un fin de semana, aquí te
        proponemos un itinerario de <strong>2 días</strong> para vivirlo a fondo.
      </p>

      <h2>Día 1: Las Pozas y el centro</h2>

      <h3>Mañana: desayuno y Las Pozas</h3>
      <p>
        Empieza con un buen desayuno huasteco que te dé energía para el día. Después, dirígete temprano a{" "}
        <Link href="/blog/visitar-las-pozas-xilitla">
          <strong>Las Pozas</strong>
        </Link>
        , el jardín surrealista del Castillo de Edward James. Llegar al abrir te permite recorrer con calma, tomar fotos
        sin multitudes y disfrutar las cascadas con mejor luz. Dedícale 2 o 3 horas.
      </p>

      <h3>Tarde: comida y centro del pueblo</h3>
      <p>
        Tras la caminata, repón fuerzas con una comida tradicional. Por la tarde, recorre el <strong>centro de Xilitla</strong>:
        su plaza principal, el ex convento agustino de San Agustín (del siglo XVI) y los callejones con vista a la
        sierra. Es perfecto para comprar café local, artesanías y dulces típicos.
      </p>

      <h3>Noche</h3>
      <p>
        Cierra el día con una cena tranquila y, si el cielo está despejado, disfruta del silencio y las estrellas que
        regala la sierra huasteca.
      </p>

      <h2>Día 2: Naturaleza, café y miradores</h2>

      <h3>Mañana: cafetales y naturaleza</h3>
      <p>
        Xilitla está rodeada de <strong>cafetales</strong>. Muchas fincas ofrecen recorridos donde aprendes el proceso
        del grano, desde la planta hasta la taza. También es buena zona para cascadas, pozas y senderos entre la
        vegetación: pregunta por las opciones según la temporada y el nivel del río.
      </p>

      <h3>Tarde: miradores y sabor huasteco</h3>
      <p>
        Aprovecha los <strong>miradores naturales</strong> con vistas a la sierra y la niebla característica de la
        región. Y antes de partir, no te vayas sin probar los{" "}
        <Link href="/blog/platillos-cocina-huasteca">platillos imperdibles de la cocina huasteca</Link>: bocoles,
        enchiladas, cecina y un buen café de olla para el camino.
      </p>

      <h2>Consejos para tu viaje a Xilitla</h2>
      <ul>
        <li>
          <strong>Mejor época:</strong> se puede visitar todo el año; en temporada de lluvias la selva está más verde,
          pero lleva impermeable.
        </li>
        <li>
          <strong>Ropa y calzado:</strong> cómodos y para clima cálido-húmedo, con algo ligero para la lluvia.
        </li>
        <li>
          <strong>Efectivo:</strong> útil para entradas, transporte local y pequeños comercios.
        </li>
        <li>
          <strong>Reserva con anticipación:</strong> en puentes y vacaciones, hospedaje y mesas se llenan rápido.
        </li>
        <li>
          <strong>Maneja con calma:</strong> las carreteras de montaña son hermosas pero con muchas curvas.
        </li>
      </ul>

      <blockquote>Xilitla se disfruta sin prisa: déjate llevar por la niebla, el café y el surrealismo.</blockquote>

      <h2>Dónde comer durante tu visita</h2>
      <p>
        <strong>El Papán Huasteco</strong> es la parada ideal en cualquier momento de tu itinerario: estamos a 5 minutos
        de Las Pozas, con estacionamiento propio y cocina huasteca auténtica. Revisa nuestra{" "}
        <Link href="/#menu-section">carta</Link> y <Link href="/#reservar">reserva tu mesa</Link> para asegurar tu
        lugar.
      </p>
    </ArticleShell>
  );
}
