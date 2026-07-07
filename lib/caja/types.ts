// Tipos y catálogos del panel de caja / finanzas del Papán Huasteco.
// Editar los catálogos aquí cambia las opciones en todo el panel.

export const TURNOS = [
  { id: "matutino", label: "Matutino" },
  { id: "vespertino", label: "Vespertino" },
  { id: "completo", label: "Día completo" },
] as const;

export const GASTO_CATEGORIAS = [
  { id: "insumos_proveedores", label: "Insumos / Proveedores" },
  { id: "nomina", label: "Nómina / Personal" },
  { id: "servicios", label: "Servicios (luz, gas, agua, internet)" },
  { id: "renta", label: "Renta" },
  { id: "mantenimiento", label: "Mantenimiento / Limpieza" },
  { id: "otros", label: "Otros" },
] as const;

export const FORMAS_PAGO = [
  { id: "efectivo", label: "Efectivo" },
  { id: "tarjeta", label: "Tarjeta" },
  { id: "transferencia", label: "Transferencia" },
] as const;

/**
 * Formas de COBRO de una cuenta (ventas). "booking" = cuentas de huéspedes
 * con alimentos incluidos en su hospedaje: el hotel las paga después, por lo
 * que SÍ es ingreso del turno pero NO entra como efectivo a la caja.
 */
export const FORMAS_COBRO = [
  { id: "efectivo", label: "Efectivo" },
  { id: "tarjeta", label: "Tarjeta" },
  { id: "transferencia", label: "Transferencia" },
  { id: "booking", label: "Booking (hotel)" },
] as const;

export type FormaCobro = (typeof FORMAS_COBRO)[number]["id"];

export const EVENTO_ESTADOS = [
  { id: "cotizado", label: "Cotizado", color: "#d97706" },
  { id: "confirmado", label: "Confirmado", color: "#2563eb" },
  { id: "realizado", label: "Realizado", color: "#7c3aed" },
  { id: "pagado", label: "Pagado", color: "#16a34a" },
  { id: "cancelado", label: "Cancelado", color: "#6b7280" },
] as const;

export type EventoEstado = (typeof EVENTO_ESTADOS)[number]["id"];

export interface Turno {
  id: string;
  fecha: string; // YYYY-MM-DD
  turno: string;
  responsable: string | null;
  estado: "abierto" | "cerrado";
  fondo_inicial: number;
  ventas_efectivo: number;
  ventas_tarjeta: number;
  ventas_transferencia: number;
  ventas_booking: number;
  otros_ingresos: number;
  otros_ingresos_nota: string | null;
  retiros: number;
  efectivo_esperado: number;
  efectivo_contado: number;
  diferencia: number;
  total_ingresos: number;
  notas: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Gasto {
  id: string;
  fecha: string; // YYYY-MM-DD
  turno_id: string | null;
  categoria: string;
  concepto: string;
  monto: number;
  forma_pago: string;
  proveedor: string | null;
  nota: string | null;
  comprobante_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Categoria {
  id: string;
  label: string;
  orden: number;
  activo: boolean;
}

export interface Meta {
  mes: string; // YYYY-MM
  meta_ventas: number;
}

/** Categorías por defecto (semilla / respaldo si aún no se corre la migración). */
export const CATEGORIAS_DEFAULT: Categoria[] = GASTO_CATEGORIAS.map((c, i) => ({
  id: c.id,
  label: c.label,
  orden: (i + 1) * 10,
  activo: true,
}));

/** Un concepto de gasto reutiliza la misma forma que una categoría. */
export type Concepto = Categoria;

/** Conceptos de gasto por defecto (respaldo si aún no se corre la fase 4). */
export const CONCEPTOS_DEFAULT: Concepto[] = [
  "Compra de carne",
  "Abarrotes / Despensa",
  "Frutas y verduras",
  "Tortillas",
  "Refrescos y bebidas",
  "Gas",
  "Luz (CFE)",
  "Agua",
  "Sueldos / Raya",
  "Renta",
  "Limpieza",
  "Mantenimiento",
  "Otro gasto",
].map((label, i) => ({ id: `c${i}`, label, orden: (i + 1) * 10, activo: true }));

export interface Evento {
  id: string;
  cliente_nombre: string;
  contacto: string | null;
  fecha: string | null; // YYYY-MM-DD
  num_personas: number | null;
  total_acordado: number;
  pagado: number;
  estado: EventoEstado;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export const labelDe = (
  cat: ReadonlyArray<{ id: string; label: string }>,
  id: string
): string => cat.find((c) => c.id === id)?.label ?? id;

// ── Fase 3: POS, cocina e inventario ──────────────────────────

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  precio: number;
  disponible: boolean;
  orden: number;
}

export interface Mesa {
  id: string;
  nombre: string;
  orden: number;
  activa: boolean;
}

export type OrdenEstado = "abierta" | "cobrada" | "cancelada";

export interface Orden {
  id: string;
  mesa_nombre: string;
  estado: OrdenEstado;
  turno_id: string | null;
  forma_pago: string | null;
  total: number;
  mesero: string | null;
  notas: string | null;
  personas: number | null;
  pago_recibido: number | null;
  comprobante_url: string | null;
  pago_referencia: string | null;
  created_at: string;
  cobrada_at: string | null;
}

export interface OrdenItem {
  id: string;
  orden_id: string;
  producto_id: string | null;
  nombre: string;
  precio_unit: number;
  cantidad: number;
  nota: string | null;
  enviado_cocina: boolean;
  estado: "pendiente" | "listo";
  created_at: string;
}

export interface Insumo {
  id: string;
  nombre: string;
  unidad: string;
  costo_unitario: number;
  stock_actual: number;
  stock_minimo: number;
}

export interface Receta {
  producto_id: string;
  insumo_id: string;
  cantidad: number;
}

/** Producto con su costo calculado y margen (para la vista de costeo). */
export interface ProductoCosteo extends Producto {
  costo: number;
  margen: number;
  tieneReceta: boolean;
}

// ── Fase 5: bitácora de movimientos ───────────────────────────

export const BITACORA_ACCIONES = [
  { id: "cobrar", label: "Cobro de cuenta" },
  { id: "cancelar_orden", label: "Cancelación de cuenta" },
  { id: "borrar_item_enviado", label: "Item borrado (ya en cocina)" },
  { id: "abrir_turno", label: "Apertura de turno" },
  { id: "cerrar_turno", label: "Cierre de turno" },
  { id: "editar_turno", label: "Edición de turno" },
  { id: "gasto_creado", label: "Gasto registrado" },
  { id: "gasto_borrado", label: "Gasto borrado" },
  { id: "pin_cambiado", label: "PIN de cancelaciones cambiado" },
] as const;

export type BitacoraAccion = (typeof BITACORA_ACCIONES)[number]["id"];

export interface Bitacora {
  id: string;
  created_at: string;
  rol: string;
  accion: string;
  detalle: string | null;
  ref_tipo: string | null;
  ref_id: string | null;
  monto: number | null;
}
