import type { Metadata } from "next";
import Link from "next/link";
import ArticleShell from "@/components/ArticleShell";
import { getPost } from "@/lib/blog";

const post = getPost("platillos-cocina-huasteca")!;

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
      ctaTitle="Ven a probar la auténtica cocina huasteca"
      ctaText="Reserva tu mesa en El Papán Huasteco, en el corazón de Xilitla."
    >
      <p>
        La <strong>cocina huasteca</strong> es una de las más ricas y subestimadas de México. Nacida del encuentro
        entre la tradición indígena teenek y náhuatl, el maíz, el chile y los ingredientes de la selva, es una cocina de
        fuego, comal y cazuela de barro. Si vienes a Xilitla o a cualquier rincón de la Huasteca Potosina, estos son los
        cinco platillos que no te puedes perder.
      </p>

      <h2>1. Bocoles</h2>
      <p>
        El bocol es el bocado huasteco por excelencia: una gordita gruesa de masa de maíz, a veces con manteca o frijol,
        cocida en el comal y rellena de lo que imagines. Los clásicos llevan <strong>queso, huevo, cecina o chorizo</strong>,
        coronados con salsa de la casa. Sencillos, reconfortantes y profundamente regionales, son el desayuno perfecto
        antes de salir a explorar.
      </p>

      <h2>2. Enchiladas huastecas</h2>
      <p>
        Las enchiladas huastecas son distintas a las del resto del país: tortillas bañadas en una salsa de chiles
        regionales, dobladas y servidas con <strong>cecina o huevo, frijoles, queso y aguacate</strong>. Hay variantes
        verdes, de chile morita o entomatadas, cada una con su personalidad. Es uno de esos platillos que resumen toda
        una región en un solo plato.
      </p>

      <h2>3. Cecina huasteca</h2>
      <p>
        La <strong>cecina</strong> (carne de res salada y secada al sol) es protagonista en la mesa huasteca. Se asa al
        comal y se sirve con guacamole, frijoles, nopales o dentro de tacos y quesadillas. Su sabor intenso y su textura
        la convierten en el acompañante ideal de casi cualquier platillo de la región.
      </p>

      <h2>4. Zacahuil</h2>
      <p>
        El <strong>zacahuil</strong> es el platillo de fiesta de la Huasteca: un tamal gigante (puede medir más de un
        metro) hecho con masa martajada, chiles y carne de cerdo o pollo, envuelto en hojas de plátano y cocido
        lentamente en horno de leña. Tradicionalmente se prepara para celebraciones y domingos de plaza. Probarlo es
        entender el alma comunitaria de esta cocina.
      </p>

      <h2>5. Café de olla y dulces de la región</h2>
      <p>
        Ninguna comida huasteca está completa sin un <strong>café de olla</strong>, endulzado con piloncillo y perfumado
        con canela. Acompáñalo de un postre regional o de la fruta de temporada de la zona. Xilitla, rodeada de
        cafetales, presume de un café que vale la pena disfrutar sin prisa.
      </p>

      <blockquote>
        La cocina huasteca no se trata de complicación, sino de ingredientes frescos, fuego y tradición.
      </blockquote>

      <h2>Dónde probar todo esto en Xilitla</h2>
      <p>
        En <strong>El Papán Huasteco</strong> preparamos todos estos sabores con ingredientes frescos y recetas de la
        región, a minutos de <Link href="/blog/visitar-las-pozas-xilitla">Las Pozas y el Castillo de Edward James</Link>.
        Echa un vistazo a nuestra <Link href="/#menu-section">carta completa</Link> (desde huevos ahogados y enchiladas
        huastecas hasta arrachera y mariscos) y ven con hambre.
      </p>
    </ArticleShell>
  );
}
