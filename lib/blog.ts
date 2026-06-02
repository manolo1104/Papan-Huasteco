export type BlogPost = {
  slug: string;
  title: string;
  cardTitle: string;
  category: string;
  meta: string;
  description: string;
  cover: string;
  coverAlt: string;
  datePublished: string;
};

export const POSTS: BlogPost[] = [
  {
    slug: "donde-comer-en-xilitla",
    title: "Dónde comer en Xilitla: guía 2026",
    cardTitle: "Dónde comer en Xilitla: guía 2026",
    category: "Guía local",
    meta: "Comer en la Huasteca · 2026",
    description:
      "Guía práctica para decidir dónde comer en Xilitla: qué buscar, dónde comer cerca de Las Pozas, horarios, precios y los platillos huastecos que no debes perderte.",
    cover: "/images/dishes/enchiladas.jpg",
    coverAlt: "Mesa con platillos huastecos en platos de barro, una opción de dónde comer en Xilitla",
    datePublished: "2026-06-01",
  },
  {
    slug: "desayunos-huastecos-tipicos",
    title: "Desayunos huastecos típicos: qué pedir",
    cardTitle: "Desayunos huastecos típicos: qué pedir",
    category: "Gastronomía",
    meta: "El desayuno en la Huasteca · 2026",
    description:
      "Qué desayunar en la Huasteca Potosina: huevos ahogados en cazuela de barro, bocoles, enchiladas, molletes de cecina y café de olla. Guía para empezar bien el día en Xilitla.",
    cover: "/images/dishes/huevos-ahogados.jpg",
    coverAlt: "Desayuno huasteco con huevos, chilaquiles y cecina servido en El Papán Huasteco, Xilitla",
    datePublished: "2026-06-01",
  },
  {
    slug: "visitar-las-pozas-xilitla",
    title: "Guía para visitar Las Pozas de Xilitla",
    cardTitle: "Guía para visitar Las Pozas de Xilitla",
    category: "Guía de viaje",
    meta: "El Castillo de Edward James · Mayo de 2026",
    description:
      "Todo lo que necesitas saber para visitar Las Pozas, el surrealista Castillo de Edward James en Xilitla: horarios, precios, cómo llegar y consejos.",
    cover: "/images/las-pozas.webp",
    coverAlt: "Las Pozas de Xilitla, el surrealista Castillo de Edward James, San Luis Potosí",
    datePublished: "2026-05-29",
  },
  {
    slug: "que-hacer-en-xilitla",
    title: "Qué hacer en Xilitla: guía de 2 días",
    cardTitle: "Qué hacer en Xilitla: guía de 2 días",
    category: "Guía de viaje",
    meta: "Pueblo Mágico de la Huasteca · Mayo de 2026",
    description:
      "Itinerario de 2 días en Xilitla, Pueblo Mágico de la Huasteca Potosina: Las Pozas, el centro, cafetales, miradores y dónde comer.",
    cover: "/images/fogon.jpg",
    coverAlt: "Ambiente y naturaleza de Xilitla, Pueblo Mágico de la Huasteca Potosina",
    datePublished: "2026-05-29",
  },
  {
    slug: "platillos-cocina-huasteca",
    title: "5 platillos imperdibles de la cocina huasteca",
    cardTitle: "5 platillos imperdibles de la cocina huasteca",
    category: "Gastronomía",
    meta: "Sabores de la Huasteca · Mayo de 2026",
    description:
      "Bocoles, enchiladas huastecas, cecina, zacahuil y café de olla: descubre los 5 platillos que tienes que probar en la cocina huasteca de Xilitla.",
    cover: "/images/plato.jpg",
    coverAlt: "Platillo tradicional de la cocina huasteca potosina servido en El Papán Huasteco",
    datePublished: "2026-05-29",
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
export const otherPosts = (slug: string) => POSTS.filter((p) => p.slug !== slug);
