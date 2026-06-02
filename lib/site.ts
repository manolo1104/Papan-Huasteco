// Datos centrales del restaurante El Papán Huasteco.
// Editar aquí para cambiar teléfono, dirección, redes, etc. en todo el sitio.

export const SITE = {
  name: "El Papán Huasteco",
  shortName: "El Papán Huasteco",
  tagline: "Cocina Huasteca Auténtica en Xilitla",
  url: "https://papan-huasteco.vercel.app",

  phoneDisplay: "(489) 125-5181",
  phoneTel: "tel:4891255181",

  whatsappNumber: "524891255181",
  whatsapp: "https://wa.me/524891255181",

  email: "elpapanhuasteco@gmail.com",
  // Endpoint sin backend para el formulario de reservas (mismo que el sitio actual)
  formEndpoint: "https://formsubmit.co/elpapanhuasteco@gmail.com",

  address: {
    street: "Camino La Conchita – Las Pozas Núm. 10",
    locality: "Xilitla",
    region: "San Luis Potosí",
    postalCode: "79910",
    country: "MX",
    full: "Camino La Conchita – Las Pozas Núm. 10, Xilitla, San Luis Potosí, 79910",
  },

  geo: { lat: 21.3845, lng: -98.9967 },

  hours: "7:30 AM - 9:00 PM",
  hoursNote: "Todos los días del año",

  rating: { value: "4.9", count: "87", best: "5" },

  mapsLink: "https://maps.google.com/?q=El+Pap%C3%A1n+Huasteco+Xilitla",
  mapsEmbed:
    "https://www.google.com/maps?q=El%20Pap%C3%A1n%20Huasteco%2C%20Camino%20La%20Conchita%20-%20Las%20Pozas%2010%2C%20Xilitla%2C%20SLP&z=15&output=embed",

  menuPdf:
    "https://img1.wsimg.com/blobby/go/a8c05a84-4571-4c63-88c9-26db66fe3d5d/Men%C3%BA%20Papan%20Huasteco.pdf",

  social: {
    instagram: "https://www.instagram.com/restaurante_papan_huasteco/",
    facebook: "https://www.facebook.com/profile.php?id=61567130595236",
    tripadvisor:
      "https://www.tripadvisor.com.mx/Restaurant_Review-g635968-d27771889-Reviews-El_Papan_Huasteco_Restaurante-Xilitla_Central_Mexico_and_Gulf_Coast.html",
  },
} as const;

export type Site = typeof SITE;
