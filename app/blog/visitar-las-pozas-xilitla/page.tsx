import type { Metadata } from "next";
import Link from "next/link";
import ArticleShell from "@/components/ArticleShell";
import { getPost } from "@/lib/blog";

const post = getPost("visitar-las-pozas-xilitla")!;

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
      ctaTitle="Tu mesa te espera, a 5 minutos de Las Pozas"
      ctaText="Reserva tu lugar y termina tu día con un buen platillo huasteco."
    >
      <p>
        Escondido en la selva de la Huasteca Potosina, <strong>Las Pozas</strong> es uno de los lugares más
        extraordinarios de México. Conocido también como el <strong>Castillo de Edward James</strong>, es un jardín
        surrealista de más de 30 hectáreas con estructuras de concreto que parecen salidas de un sueño: escaleras que
        terminan en el cielo, columnas gigantes y flores de piedra entre cascadas y pozas naturales. Si vas a visitar
        Xilitla, este es el lugar imperdible. Aquí te contamos todo lo que necesitas saber.
      </p>

      <h2>¿Qué es Las Pozas?</h2>
      <p>
        Las Pozas fue la obra de la vida del poeta y mecenas inglés <strong>Edward James</strong>, quien a partir de los
        años cincuenta construyó este jardín surrealista en colaboración con artesanos locales. Enamorado de la
        exuberancia de la selva xilitlense, James levantó decenas de estructuras de concreto inspiradas en formas
        orgánicas, mezcladas con orquídeas, cascadas y los ríos cristalinos de la zona. Hoy es un espacio cultural
        protegido y una de las visitas obligadas de la Huasteca Potosina.
      </p>

      <h2>Horarios y precios</h2>
      <p>
        Las Pozas abre <strong>todos los días</strong>, normalmente de 9:00 a 18:00 horas. El precio de entrada general
        ronda los $100 MXN por persona, con descuentos para estudiantes, personas mayores y niños. Los costos y horarios
        pueden cambiar por temporada, así que te recomendamos confirmar en los canales oficiales del recinto antes de tu
        visita, sobre todo en puentes y vacaciones, cuando suele haber mucha afluencia.
      </p>

      <h2>Cómo llegar</h2>
      <p>
        Las Pozas está a las afueras del pueblo de Xilitla, en el camino conocido como{" "}
        <strong>La Conchita – Las Pozas</strong>. Desde el centro de Xilitla son apenas unos minutos en auto o taxi. Si
        llegas desde Ciudad Valles o desde San Luis Potosí, sigue las indicaciones hacia Xilitla y, una vez en el
        pueblo, hacia Las Pozas. La carretera de montaña es hermosa, pero con curvas: maneja con calma y disfruta el
        paisaje.
      </p>
      <blockquote>
        Consejo: nosotros estamos a solo 5 minutos caminando del Castillo de Edward James, con estacionamiento propio.
        Es la parada perfecta antes o después de tu visita.
      </blockquote>

      <h2>Consejos prácticos para tu visita</h2>
      <ul>
        <li>
          <strong>Calzado cómodo y antiderrapante.</strong> Hay muchas escaleras, rampas y superficies que pueden estar
          húmedas o resbalosas.
        </li>
        <li>
          <strong>Llega temprano.</strong> Por la mañana hay menos gente, mejor luz para fotos y temperatura más
          agradable.
        </li>
        <li>
          <strong>Lleva agua y repelente.</strong> Estás en plena selva: hidrátate y protégete de los mosquitos.
        </li>
        <li>
          <strong>Traje de baño (según temporada).</strong> Algunas pozas permiten el baño; consulta las reglas vigentes
          el día de tu visita.
        </li>
        <li>
          <strong>Efectivo a la mano.</strong> No siempre hay señal o terminal para tarjeta en la entrada.
        </li>
        <li>
          <strong>Respeta el lugar.</strong> Es patrimonio cultural y natural: no rayes las estructuras ni dejes basura.
        </li>
      </ul>

      <h2>¿Cuánto tiempo dedicarle?</h2>
      <p>
        Para recorrer Las Pozas con calma, tomar fotos y disfrutar las pozas, calcula entre <strong>2 y 3 horas</strong>.
        Si eres fotógrafo o amante del arte, fácilmente puedes pasar media mañana. Lo ideal es combinar la visita con un
        buen desayuno antes de entrar (para tener energía) y una comida tranquila al salir.
      </p>

      <h2>Dónde comer cerca de Las Pozas</h2>
      <p>
        Después de tanto caminar entre selva y escaleras, lo mejor es una comida reconfortante. En{" "}
        <strong>El Papán Huasteco</strong> servimos cocina huasteca auténtica a minutos de Las Pozas: desde huevos
        ahogados en cazuela de barro y enchiladas huastecas, hasta cecina, arrachera y café de olla. Puedes ver nuestra{" "}
        <Link href="/#menu-section">carta completa aquí</Link> o conocer más sobre los{" "}
        <Link href="/blog/platillos-cocina-huasteca">platillos imperdibles de la cocina huasteca</Link>.
      </p>
    </ArticleShell>
  );
}
