// Reglas de personalización por tipo de platillo (POS).
// Cada grupo es de SELECCIÓN ÚNICA (ej. un solo sabor de licuado); las chips
// sueltas (quitar ingredientes / extras) siguen siendo multi-selección.
// Todo se guarda como texto en la `nota` del renglón → la cocina ya lo muestra.
//
// Para agregar reglas: añade otra entrada a REGLAS con su patrón y grupos.

export interface GrupoOpciones {
  titulo: string;
  opciones: string[];
}

const SABOR_LICUADO: GrupoOpciones = {
  titulo: "Sabor",
  opciones: ["Plátano", "Fresa", "Frutos rojos", "Combinado"],
};
const LECHE: GrupoOpciones = {
  titulo: "Leche",
  opciones: ["Leche normal", "Leche deslactosada"],
};
const AZUCAR: GrupoOpciones = {
  titulo: "Azúcar",
  opciones: ["Con azúcar", "Sin azúcar"],
};
const TERMINO: GrupoOpciones = {
  titulo: "Término de la carne",
  opciones: ["Término rojo", "Término medio", "Tres cuartos", "Bien cocido"],
};
const ESTILO_HUEVOS: GrupoOpciones = {
  titulo: "Estilo",
  opciones: [
    "Estrellados",
    "Revueltos",
    "Con jamón",
    "Con chorizo",
    "A la mexicana",
    "Divorciados",
    "Rancheros",
    "Enhojados",
  ],
};
const SALSA_CHILAQUILES: GrupoOpciones = {
  titulo: "Salsa",
  opciones: ["Rojos", "Verdes", "Morita"],
};

const sinAcentos = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const REGLAS: { patron: RegExp; grupos: GrupoOpciones[] }[] = [
  { patron: /licuado/, grupos: [SABOR_LICUADO, LECHE, AZUCAR] },
  { patron: /arrachera|bistec|res\b|rib ?eye/, grupos: [TERMINO] },
  { patron: /huevos al gusto/, grupos: [ESTILO_HUEVOS] },
  { patron: /chilaquiles/, grupos: [SALSA_CHILAQUILES] },
  { patron: /cafe|chocomilk|chocolate/, grupos: [AZUCAR] },
];

/** Grupos de opciones que aplican a un platillo según su nombre. */
export function gruposPara(nombreProducto: string): GrupoOpciones[] {
  const n = sinAcentos(nombreProducto);
  const grupos: GrupoOpciones[] = [];
  for (const r of REGLAS) {
    if (r.patron.test(n)) {
      for (const g of r.grupos) if (!grupos.includes(g)) grupos.push(g);
    }
  }
  return grupos;
}

/** Chips genéricas (multi-selección) que aplican a cualquier platillo. */
export const QUITABLES = [
  "Sin cebolla",
  "Sin crema",
  "Sin queso",
  "Sin chile",
  "Sin cilantro",
  "Sin frijoles",
  "Sin lechuga",
  "Sin jitomate",
  "Sin picante",
  "Sin salsa",
];
export const EXTRAS = ["Para llevar", "Salsa aparte", "Bien dorado", "Poco picante"];
