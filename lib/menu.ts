// Datos del menú del Papán Huasteco. Precios en pesos mexicanos.
// Editar aquí para actualizar la carta — la sección de menú se genera sola.

export type MenuItem = {
  name: string;
  desc?: string;
  price: string;
};

export type MenuCategory = {
  id: string;
  label: string;
  /** Platillo destacado de la categoría (opcional). */
  featured?: {
    badge: string;
    icon: string; // id de Icons (ej. "star", "grain")
    name: string;
    desc: string;
    price: string;
  };
  items: MenuItem[];
};

export const MENU: MenuCategory[] = [
  {
    id: "desayunos",
    label: "Desayunos",
    featured: {
      badge: "Estrella del desayuno",
      icon: "star",
      name: "Huevos Ahogados",
      desc: "En salsa ranchera con rajas poblanas, queso y aguacate en cazuela de barro. Con frijoles y tortillas del comal.",
      price: "$150",
    },
    items: [
      { name: "Licuados", desc: "Plátano · Papaya", price: "$45" },
      { name: "Licuado de Fresa", price: "$65" },
      { name: "Licuados Combinados", desc: "Manzana c/avena · Plátano c/chocomilk", price: "$65" },
      { name: "Parfait", desc: "Yogurt griego, chía, granola y miel", price: "$80" },
      { name: "Bowl de Fruta de Temporada", desc: "Con miel natural y limón", price: "$60" },
      { name: "Hotcakes", desc: "2 pzas. con plátano y mermelada casera", price: "$80" },
      { name: "Molletes", desc: "C/cecina o C/chorizo · frijoles y pico de gallo", price: "$85" },
      { name: "Huevos al Gusto", desc: "Jamón de pavo, chorizo, mexicana, divorciados, rancheros, enhojados", price: "$110" },
      { name: "Huevos con Nopales y Queso Panela", price: "$130" },
      { name: "Omelettes", desc: "Pimientos y mozzarella · Jamón · Espinacas · Claras · Frijol", price: "$130" },
      { name: "Chilaquiles", desc: "Rojos, verdes o morita · C/cecina o huevos · frijoles", price: "$195" },
    ],
  },
  {
    id: "comal",
    label: "Del Comal",
    featured: {
      badge: "Para compartir",
      icon: "grain",
      name: "Bandeja Huasteca (3 personas)",
      desc: "Variedad de enchiladas, bocoles y cecina. La mejor forma de probar la Huasteca entera.",
      price: "$450",
    },
    items: [
      { name: "Enchiladas Huastecas", desc: "5 pzas · C/cecina ó huevos y frijoles", price: "$175" },
      { name: "Enchiladas Verdes", price: "$175" },
      { name: "Enchiladas de Chile Morita", price: "$175" },
      { name: "Entomatadas", price: "$175" },
      { name: "Enchorizadas", price: "$195" },
      { name: "Ajonjolinadas", price: "$195" },
      { name: "Enfrijoladas Naturales", desc: "C/cecina ó huevos, crema, queso y aguacate", price: "$165" },
      { name: "Enfrijoladas del Papán", desc: "Con chorizo · crema, queso y aguacate", price: "$195" },
      { name: "Quesadillas Asadas", desc: "Cecina o pollo · con ensalada", price: "$175" },
    ],
  },
  {
    id: "principales",
    label: "Principales",
    featured: {
      badge: "Favorito",
      icon: "flame",
      name: "Arrachera 300 grs",
      desc: "Con guacamole, quesadillas, nopal gratinado, chile toreado y cebollita.",
      price: "$350",
    },
    items: [
      { name: "Sopa Huasteca", desc: "Caldo de frijol, pico de gallo, queso y aguacate", price: "$55" },
      { name: "Ensalada de la Casa", desc: "Espinacas, frutos rojos, nuez caramelizada y balsámico", price: "$180" },
      { name: "Fajitas", desc: "Pollo o cecina · pimientos, cebolla, guacamole", price: "$195" },
      { name: "Pollo a la Plancha", desc: "Con ensalada y arroz", price: "$180" },
      { name: "Milanesa de Pollo", desc: "Ensalada, arroz y papas", price: "$220" },
      { name: "Fettuccini Alfredo", desc: "Con camarón o con pollo", price: "$220" },
      { name: "Spaguetti Boloñesa", price: "$195" },
      { name: "Postres", desc: "Carrot Cake · Pay de queso cremoso", price: "$65" },
    ],
  },
  {
    id: "mar",
    label: "Del Mar",
    featured: {
      badge: "Del Mar",
      icon: "fish",
      name: "Salmón a la Plancha",
      desc: "Con ensalada verde, tomate cherry y reducción de balsámico.",
      price: "$250",
    },
    items: [
      { name: "Camarones al Mojo de Ajo", desc: "Con arroz y ensalada", price: "$220" },
      { name: "Camarones Empanizados", desc: "Con ensalada, papas y aderezo", price: "$220" },
      { name: "Camarones a la Diabla", price: "$220" },
      { name: "Camarones Coco", desc: "Con ensalada, papas y aderezo", price: "$220" },
      { name: "Filete a la Plancha", desc: "Con ensalada y arroz", price: "$195" },
      { name: "Filete en Hoja de Plátano", desc: "Con pimientos, cebolla, jitomate y arroz blanco", price: "$230" },
      { name: "Filete Empanizado", desc: "Con arroz, ensalada y papas", price: "$220" },
      { name: "Molcajete de Ceviche", price: "$160" },
    ],
  },
  {
    id: "antojitos",
    label: "Antojitos",
    items: [
      { name: "Sopes (1 pza.)", desc: "C/cecina o C/chorizo · frijoles, queso, crema, aguacate", price: "$120" },
      { name: "Bocoles (2 pzas.)", desc: "Huevo verde · Queso con salsa · Frijoles con queso", price: "$60" },
      { name: "Bocoles con Cecina o Chorizo", price: "$80" },
      { name: "Tacos de Cecina (3 pzs.)", desc: "Cebolla caramelizada, cilantro y salsa casera", price: "$150" },
      { name: "Guacamole", price: "$110" },
      { name: "Queso Fundido en Hoja de Plátano", desc: "Natural o C/chorizo", price: "$90 - $125" },
      { name: "Sandwich", desc: "Pollo a la plancha o jamón y queso", price: "$90" },
      { name: "Sincronizadas", desc: "2 tortillas de harina con jamón, queso y ensalada", price: "$60" },
    ],
  },
  {
    id: "bebidas",
    label: "Bebidas",
    items: [
      { name: "Jugo de Naranja", price: "$40" },
      { name: "Café Americano", desc: "Con refill", price: "$40" },
      { name: "Café de Olla", price: "$45" },
      { name: "Aguas de Fruta Natural", price: "$45" },
      { name: "Té", price: "$30" },
      { name: "Chocomilk / Chocolate", price: "$45 - $55" },
      { name: "Cerveza Corona / Victoria", price: "$45" },
      { name: "Negra Modelo / Modelo Especial", price: "$55" },
      { name: "Refrescos / Agua Mineral", price: "$35" },
    ],
  },
];

export const SPECIALTIES = [
  "Bocoles",
  "Enchiladas Huastecas",
  "Cecina",
  "Zacahuil",
  "Huevos Ahogados",
  "Café de Olla",
  "Arrachera",
  "Bandeja Huasteca",
];
