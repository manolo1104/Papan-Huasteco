// Datos centrales del restaurante El Papán Huasteco.
// Editar aquí para cambiar teléfono, dirección, redes, etc. en todo el sitio.
//
// NAP (nombre, dirección, teléfono), horario, coordenadas y calificación
// copiados EXACTO del Google Business Profile (ficha verificada, jul 2026).
// Si algo cambia en la ficha de Google, cámbialo aquí también — deben ser
// idénticos para el SEO local.

export const SITE = {
  name: "El Papán Huasteco",
  shortName: "El Papán Huasteco",
  tagline: "Cocina Huasteca Auténtica en Xilitla",
  // TODO: al comprar/conectar el dominio propio (elpapanhuasteco.com estaba
  // libre en jul 2026), cambiar SOLO esta línea — canónicas, schema, OG,
  // sitemap y llms.txt se actualizan solos.
  url: "https://papan-huasteco.vercel.app",

  phoneDisplay: "(489) 125-5181",
  phoneTel: "tel:+524891255181",

  whatsappNumber: "524891255181",
  whatsapp: "https://wa.me/524891255181",

  email: "elpapanhuasteco@gmail.com",
  // Endpoint sin backend para el formulario de reservas (mismo que el sitio actual)
  formEndpoint: "https://formsubmit.co/elpapanhuasteco@gmail.com",

  address: {
    street: "Camino a Las Pozas 10, La Conchita",
    locality: "Xilitla",
    region: "San Luis Potosí",
    postalCode: "79900",
    country: "MX",
    full: "Camino a Las Pozas 10, La Conchita, 79900 Xilitla, S.L.P.",
  },

  geo: { lat: 21.3950344, lng: -98.9913514 },

  hours: "8:00 AM - 8:00 PM",
  hoursNote: "Todos los días del año",

  rating: { value: "4.7", count: "514", best: "5" },

  mapsLink:
    "https://www.google.com/maps/place/El+Pap%C3%A1n+Huasteco+Xilitla/@21.3950344,-98.9913514,17z/",
  mapsEmbed:
    "https://www.google.com/maps?q=El%20Pap%C3%A1n%20Huasteco%20Xilitla%2C%20Camino%20a%20Las%20Pozas%2010%2C%20La%20Conchita%2C%20Xilitla%2C%20SLP&z=16&output=embed",

  social: {
    instagram: "https://www.instagram.com/restaurante_papan_huasteco/",
    facebook: "https://www.facebook.com/profile.php?id=61567130595236",
    tiktok: "https://www.tiktok.com/@papan_huasteco_xilitla",
    tripadvisor:
      "https://www.tripadvisor.com.mx/Restaurant_Review-g635968-d27771889-Reviews-El_Papan_Huasteco_Restaurante-Xilitla_Central_Mexico_and_Gulf_Coast.html",
  },
} as const;

export type Site = typeof SITE;
