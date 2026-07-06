// Datos estructurados (Schema.org / JSON-LD) centralizados.
// Sirven tanto para SEO (resultados enriquecidos de Google) como para AI-SEO/AEO
// (que ChatGPT, Perplexity, Gemini y Google AI Overviews puedan citar datos exactos).
import { SITE } from "./site";
import { MENU, type MenuCategory } from "./menu";
import { FAQS, type Faq } from "./faq";
import { POSTS, type BlogPost } from "./blog";

const ORG_ID = `${SITE.url}/#restaurant`;
const WEBSITE_ID = `${SITE.url}/#website`;

const ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: SITE.address.street,
  addressLocality: SITE.address.locality,
  addressRegion: SITE.address.region,
  postalCode: SITE.address.postalCode,
  addressCountry: SITE.address.country,
};

const AMENITIES = [
  "Estacionamiento propio gratuito",
  "Terraza al aire libre",
  "Pet-friendly (se admiten mascotas)",
  "WiFi disponible",
  "Acepta tarjeta y efectivo",
].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true }));

/** Restaurant / LocalBusiness enriquecido (entidad principal del sitio). */
export function restaurantSchema() {
  return {
    "@type": ["Restaurant", "LocalBusiness"],
    "@id": ORG_ID,
    name: "El Papán Huasteco",
    description:
      "Restaurante de cocina huasteca potosina auténtica en Xilitla, San Luis Potosí, a 5 minutos del Castillo de Edward James (Las Pozas). Desayunos, comidas y cenas todos los días.",
    slogan: "Cocina huasteca de verdad, en el corazón de Xilitla.",
    url: SITE.url,
    telephone: "+52-489-125-5181",
    image: [`${SITE.url}/images/og-image.jpg`, `${SITE.url}/images/terraza.jpg`],
    logo: `${SITE.url}/images/logo.png`,
    servesCuisine: ["Mexicana", "Huasteca", "Cocina Huasteca Potosina"],
    priceRange: "$$",
    acceptsReservations: true,
    paymentAccepted: "Efectivo, Tarjeta de crédito y débito",
    currenciesAccepted: "MXN",
    hasMenu: `${SITE.url}/#menu`,
    menu: `${SITE.url}/#menu-section`,
    keywords:
      "restaurante Xilitla, comida huasteca, dónde comer cerca de Las Pozas, restaurante Castillo de Edward James, cocina huasteca potosina",
    areaServed: ["Xilitla", "Huasteca Potosina", "San Luis Potosí"],
    address: ADDRESS,
    hasMap: SITE.mapsLink,
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    amenityFeature: AMENITIES,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "08:00",
        closes: "20:00",
      },
    ],
    // Nota: sin aggregateRating a propósito — Google exige que las
    // calificaciones marcadas provengan de reseñas recolectadas en el propio
    // sitio, no de la ficha de Google. El 4.7 real se muestra en la interfaz
    // con link a la ficha, que es lo correcto.
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: SITE.whatsapp,
        inLanguage: "es-MX",
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      result: { "@type": "Reservation", name: "Reserva de mesa en El Papán Huasteco" },
    },
    sameAs: [
      SITE.social.instagram,
      SITE.social.facebook,
      SITE.social.tiktok,
      SITE.social.tripadvisor,
      SITE.mapsLink,
    ],
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE.url,
    name: "El Papán Huasteco",
    inLanguage: "es-MX",
    publisher: { "@id": ORG_ID },
  };
}

export function faqPageSchema(faqs: Faq[] = FAQS) {
  return {
    "@type": "FAQPage",
    "@id": `${SITE.url}/#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Extrae el primer número de un precio ("$90 - $125" -> 90, "desde $60" -> 60). */
function parsePrice(price: string): string {
  const m = price.match(/\d+/);
  return m ? m[0] : "";
}

export function menuSchema(menu: MenuCategory[] = MENU) {
  return {
    "@type": "Menu",
    "@id": `${SITE.url}/#menu`,
    name: "Menú de El Papán Huasteco",
    inLanguage: "es-MX",
    hasMenuSection: menu.map((cat) => {
      const items = [...(cat.featured ? [{ name: cat.featured.name, desc: cat.featured.desc, price: cat.featured.price }] : []), ...cat.items];
      return {
        "@type": "MenuSection",
        name: cat.label,
        hasMenuItem: items.map((it) => ({
          "@type": "MenuItem",
          name: it.name,
          ...(it.desc ? { description: it.desc } : {}),
          offers: { "@type": "Offer", price: parsePrice(it.price), priceCurrency: "MXN" },
        })),
      };
    }),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function blogPostingSchema(post: BlogPost) {
  return {
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: `${SITE.url}${post.cover}`,
    inLanguage: "es-MX",
    author: { "@type": "Organization", name: "El Papán Huasteco", url: SITE.url },
    publisher: { "@id": ORG_ID },
    datePublished: post.datePublished,
    dateModified: post.datePublished,
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
    isPartOf: { "@id": WEBSITE_ID },
  };
}

/** Grafo principal del sitio (entidad de negocio + sitio web). Va en el layout. */
export function siteGraph() {
  return { "@context": "https://schema.org", "@graph": [restaurantSchema(), websiteSchema()] };
}

/** Lista de posts para el índice del blog (Blog + ItemList). */
export function blogIndexSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE.url}/blog#blog`,
    name: "Blog de El Papán Huasteco",
    inLanguage: "es-MX",
    publisher: { "@id": ORG_ID },
    blogPost: POSTS.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE.url}/blog/${p.slug}`,
      datePublished: p.datePublished,
    })),
  };
}
