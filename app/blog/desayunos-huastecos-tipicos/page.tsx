import type { Metadata } from "next";
import Link from "next/link";
import ArticleShell from "@/components/ArticleShell";
import { getPost } from "@/lib/blog";

const post = getPost("desayunos-huastecos-tipicos")!;

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
      ctaTitle="Ven a desayunar a Xilitla"
      ctaText="Abrimos desde las 8:00 AM, a 5 minutos de Las Pozas. Reserva tu mesa."
    >
      <p>
        El desayuno es sagrado en la Huasteca, y en Xilitla es la mejor forma de empezar el día antes de salir a
        explorar. Aquí tienes los <strong>desayunos huastecos típicos</strong> que vale la pena pedir y por qué.
      </p>

      <h2>1. Huevos ahogados en cazuela de barro</h2>
      <p>
        El desayuno estrella: huevos en salsa ranchera con rajas poblanas, queso y aguacate, servidos en cazuela de
        barro con frijoles de olla y tortillas del comal. Reconfortante y con todo el sabor de la región.
      </p>

      <h2>2. Bocoles</h2>
      <p>
        Gorditas gruesas de masa de maíz cocidas al comal, rellenas de frijol, queso, cecina o chorizo. Son el antojito
        huasteco por excelencia y un desayuno ligero perfecto para el camino.
      </p>

      <h2>3. Enchiladas huastecas</h2>
      <p>
        Tortillas bañadas en salsa de chiles regionales, con cecina o huevo, frijoles, queso y aguacate. Hay versiones
        verdes, de chile morita y entomatadas; cada una con su personalidad.
      </p>

      <h2>4. Molletes de cecina</h2>
      <p>
        Pan con frijoles, queso gratinado y cecina, coronados con pico de gallo. Sencillos y muy sabrosos, ideales si
        viajas con niños.
      </p>

      <h2>5. Café de olla</h2>
      <p>
        Café endulzado con piloncillo y canela, servido bien caliente. En Xilitla, rodeada de cafetales, acompaña
        cualquier desayuno a la perfección.
      </p>

      <blockquote>Un buen desayuno antes de Las Pozas te da energía para las 2 o 3 horas de recorrido y sus escaleras.</blockquote>

      <h2>Dónde desayunar en Xilitla</h2>
      <p>
        En <strong>El Papán Huasteco</strong> servimos todos estos desayunos desde las 8:00 AM, a 5 minutos de Las
        Pozas y con estacionamiento propio. Revisa el <Link href="/menu">menú completo</Link>, conoce más sobre{" "}
        <Link href="/las-pozas">cómo llegar desde Las Pozas</Link> o <Link href="/#reservar">reserva tu mesa</Link>.
      </p>
    </ArticleShell>
  );
}
