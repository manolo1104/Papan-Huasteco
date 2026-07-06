import type { Metadata } from "next";
import Link from "next/link";
import ArticleShell from "@/components/ArticleShell";
import { getPost } from "@/lib/blog";

const post = getPost("donde-comer-en-xilitla")!;

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
      ctaTitle="Reserva tu mesa en Xilitla"
      ctaText="Cocina huasteca a 5 minutos de Las Pozas, con estacionamiento propio."
    >
      <p>
        Xilitla es un Pueblo Mágico pequeño, pero tiene más opciones para comer de las que parece: desde fondas en el
        centro hasta restaurantes con vista a la sierra. Esta guía te ayuda a decidir <strong>dónde comer en Xilitla</strong>
        {" "}según lo que buscas: un desayuno antes de Las Pozas, una comida tranquila o cocina huasteca auténtica.
      </p>

      <h2>Qué buscar en un buen restaurante en Xilitla</h2>
      <ul>
        <li>
          <strong>Cocina hecha al momento:</strong> el sazón casero se nota. Pregunta si preparan al comal y en cazuela
          de barro.
        </li>
        <li>
          <strong>Cercanía a lo que vas a visitar:</strong> si tu plan es Las Pozas, conviene comer cerca para no perder
          tiempo en traslados.
        </li>
        <li>
          <strong>Estacionamiento:</strong> el centro se satura en fines de semana; un lugar con estacionamiento propio
          te ahorra el problema.
        </li>
        <li>
          <strong>Horario amplio:</strong> útil si llegas temprano a desayunar o tarde después de caminar.
        </li>
      </ul>

      <h2>Dónde comer cerca de Las Pozas</h2>
      <p>
        Si tu visita gira en torno al Castillo de Edward James, lo más cómodo es comer a unos minutos de la entrada.{" "}
        <strong>El Papán Huasteco</strong> está a 5 minutos caminando de Las Pozas, con estacionamiento propio y terraza
        al aire libre. Es la opción natural para desayunar antes del recorrido o comer al salir. Te contamos más en
        nuestra página <Link href="/las-pozas">dónde comer cerca de Las Pozas</Link>.
      </p>

      <h2>Qué pedir: platillos huastecos imperdibles</h2>
      <p>
        La cocina huasteca es el alma de la región. No te vayas sin probar enchiladas huastecas, bocoles al comal,
        cecina, huevos ahogados en cazuela de barro y un café de olla. Si quieres el detalle, lee nuestra guía de{" "}
        <Link href="/blog/platillos-cocina-huasteca">5 platillos imperdibles de la cocina huasteca</Link> o revisa el{" "}
        <Link href="/menu">menú completo</Link>.
      </p>

      <blockquote>Comer bien en Xilitla no es caro: en El Papán los desayunos arrancan en $45 y los principales rondan $150 a $350.</blockquote>

      <h2>Horarios y reservación</h2>
      <p>
        En temporada alta (puentes y vacaciones) los mejores lugares se llenan. Te recomendamos reservar con
        anticipación si viajas en fin de semana. En El Papán Huasteco abrimos todos los días de 8:00 AM a 8:00 PM y
        puedes <Link href="/#reservar">reservar tu mesa</Link> en un minuto.
      </p>
    </ArticleShell>
  );
}
