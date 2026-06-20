import {
  GASTO_CATEGORIAS,
  FORMAS_PAGO,
  TURNOS,
  EVENTO_ESTADOS,
} from "./types";

// Helpers de saneo + cálculo del corte de caja. Todo esto corre SOLO en el
// servidor (rutas /api/admin). Nunca confiar en lo que manda el navegador.

export const num = (v: unknown): number => {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const str = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
};
const round2 = (n: number) => Math.round(n * 100) / 100;
const isDate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

const TURNO_IDS = TURNOS.map((t) => t.id) as string[];
const CAT_IDS = GASTO_CATEGORIAS.map((c) => c.id) as string[];
const PAGO_IDS = FORMAS_PAGO.map((p) => p.id) as string[];
const EVENTO_IDS = EVENTO_ESTADOS.map((e) => e.id) as string[];

/** Fecha de HOY en horario de México (YYYY-MM-DD). */
export function todayISO(): string {
  const mx = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" })
  );
  const y = mx.getFullYear();
  const m = String(mx.getMonth() + 1).padStart(2, "0");
  const d = String(mx.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Suma/resta días a una fecha YYYY-MM-DD (aritmética segura en UTC). */
export function addDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

/**
 * Calcula cuánto efectivo DEBERÍA haber en la caja y la diferencia contra lo
 * que el encargado contó físicamente. diferencia < 0 = FALTANTE, > 0 = sobrante.
 * Nota: `otros_ingresos` se asume cobrado en efectivo.
 */
export function calcularCorte(i: {
  fondo_inicial: number;
  ventas_efectivo: number;
  otros_ingresos: number;
  retiros: number;
  gastos_efectivo: number;
  efectivo_contado: number;
}) {
  const efectivo_esperado = round2(
    num(i.fondo_inicial) +
      num(i.ventas_efectivo) +
      num(i.otros_ingresos) -
      num(i.gastos_efectivo) -
      num(i.retiros)
  );
  return {
    efectivo_esperado,
    diferencia: round2(num(i.efectivo_contado) - efectivo_esperado),
  };
}

/** Valida los datos para ABRIR un turno (fondo inicial). */
export function sanitizeAbrirTurno(body: Record<string, unknown>) {
  if (!isDate(body.fecha)) return { error: "Falta la fecha del turno." };
  const turno = str(body.turno);
  if (!turno || !TURNO_IDS.includes(turno))
    return { error: "Selecciona un turno válido." };
  return {
    data: {
      fecha: body.fecha as string,
      turno,
      responsable: str(body.responsable),
      fondo_inicial: num(body.fondo_inicial),
      estado: "abierto" as const,
    },
  };
}

/** Valida los datos para CERRAR un turno (ventas + conteo de efectivo). */
export function sanitizeCerrarTurno(body: Record<string, unknown>) {
  return {
    data: {
      ventas_efectivo: num(body.ventas_efectivo),
      ventas_tarjeta: num(body.ventas_tarjeta),
      otros_ingresos: num(body.otros_ingresos),
      otros_ingresos_nota: str(body.otros_ingresos_nota),
      retiros: num(body.retiros),
      efectivo_contado: num(body.efectivo_contado),
      notas: str(body.notas),
    },
  };
}

/** Campos que el dueño (admin) puede editar de un turno ya cerrado. */
export function sanitizeEditarTurno(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of [
    "fondo_inicial",
    "ventas_efectivo",
    "ventas_tarjeta",
    "otros_ingresos",
    "retiros",
    "efectivo_contado",
  ]) {
    if (f in body) out[f] = num(body[f]);
  }
  for (const f of ["responsable", "otros_ingresos_nota", "notas"]) {
    if (f in body) out[f] = str(body[f]);
  }
  return { data: out };
}

export function sanitizeGasto(
  body: Record<string, unknown>,
  modo: "create" | "patch"
) {
  const out: Record<string, unknown> = {};
  if (modo === "create" || "concepto" in body) {
    const concepto = str(body.concepto);
    if (!concepto) return { error: "Describe el gasto (concepto)." };
    out.concepto = concepto;
  }
  if (modo === "create" || "monto" in body) {
    const monto = num(body.monto);
    if (monto <= 0) return { error: "El monto debe ser mayor a cero." };
    out.monto = monto;
  }
  if (modo === "create" || "categoria" in body) {
    const c = str(body.categoria) ?? "otros";
    out.categoria = CAT_IDS.includes(c) ? c : "otros";
  }
  if (modo === "create" || "forma_pago" in body) {
    const p = str(body.forma_pago) ?? "efectivo";
    out.forma_pago = PAGO_IDS.includes(p) ? p : "efectivo";
  }
  if ("fecha" in body && isDate(body.fecha)) out.fecha = body.fecha;
  if (modo === "create" && !out.fecha) out.fecha = todayISO();
  if ("turno_id" in body) out.turno_id = str(body.turno_id);
  if ("comprobante_url" in body) out.comprobante_url = str(body.comprobante_url);
  for (const f of ["proveedor", "nota"]) if (f in body) out[f] = str(body[f]);
  return { data: out };
}

export function sanitizeEvento(
  body: Record<string, unknown>,
  modo: "create" | "patch"
) {
  const out: Record<string, unknown> = {};
  if (modo === "create" || "cliente_nombre" in body) {
    const n = str(body.cliente_nombre);
    if (!n) return { error: "Falta el nombre del cliente o evento." };
    out.cliente_nombre = n;
  }
  if (modo === "create" || "total_acordado" in body)
    out.total_acordado = num(body.total_acordado);
  if ("pagado" in body) out.pagado = num(body.pagado);
  if ("estado" in body) {
    const e = str(body.estado) ?? "cotizado";
    out.estado = EVENTO_IDS.includes(e) ? e : "cotizado";
  }
  if (modo === "create" && !("estado" in body)) out.estado = "cotizado";
  if ("fecha" in body) out.fecha = isDate(body.fecha) ? body.fecha : null;
  if ("num_personas" in body) {
    const n = Number(body.num_personas);
    out.num_personas = Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
  }
  for (const f of ["contacto", "notas"]) if (f in body) out[f] = str(body[f]);
  return { data: out };
}

// ── Fase 2 ────────────────────────────────────────────────────

/** Mes actual 'YYYY-MM' en horario de México. */
export function mesActual(): string {
  return todayISO().slice(0, 7);
}

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40) || "categoria";

export function sanitizeCategoria(
  body: Record<string, unknown>,
  modo: "create" | "patch"
) {
  const out: Record<string, unknown> = {};
  if (modo === "create" || "label" in body) {
    const label = str(body.label);
    if (!label) return { error: "Escribe el nombre de la categoría." };
    out.label = label;
    if (modo === "create") {
      const rawId = str(body.id);
      out.id = slugify(rawId || label);
    }
  }
  if ("orden" in body) {
    const o = Number(body.orden);
    out.orden = Number.isFinite(o) ? Math.floor(o) : 100;
  }
  if ("activo" in body) out.activo = Boolean(body.activo);
  return { data: out };
}

export function sanitizeMeta(body: Record<string, unknown>) {
  const mes = str(body.mes);
  if (!mes || !/^\d{4}-\d{2}$/.test(mes))
    return { error: "Mes inválido (formato YYYY-MM)." };
  return { data: { mes, meta_ventas: num(body.meta_ventas) } };
}

// ── Fase 3: POS, cocina, inventario ───────────────────────────

const posInt = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
};

export function sanitizeProducto(
  body: Record<string, unknown>,
  modo: "create" | "patch"
) {
  const out: Record<string, unknown> = {};
  if (modo === "create" || "nombre" in body) {
    const nombre = str(body.nombre);
    if (!nombre) return { error: "Escribe el nombre del producto." };
    out.nombre = nombre;
  }
  if (modo === "create" || "precio" in body) out.precio = num(body.precio);
  if ("descripcion" in body) out.descripcion = str(body.descripcion);
  if ("categoria" in body) out.categoria = str(body.categoria) ?? "otros";
  if (modo === "create" && !("categoria" in body)) out.categoria = "otros";
  if ("disponible" in body) out.disponible = Boolean(body.disponible);
  if ("orden" in body) {
    const o = Number(body.orden);
    out.orden = Number.isFinite(o) ? Math.floor(o) : 100;
  }
  return { data: out };
}

export function sanitizeMesa(
  body: Record<string, unknown>,
  modo: "create" | "patch"
) {
  const out: Record<string, unknown> = {};
  if (modo === "create" || "nombre" in body) {
    const nombre = str(body.nombre);
    if (!nombre) return { error: "Escribe el nombre de la mesa." };
    out.nombre = nombre;
  }
  if ("orden" in body) {
    const o = Number(body.orden);
    out.orden = Number.isFinite(o) ? Math.floor(o) : 100;
  }
  if ("activa" in body) out.activa = Boolean(body.activa);
  return { data: out };
}

export function sanitizeInsumo(
  body: Record<string, unknown>,
  modo: "create" | "patch"
) {
  const out: Record<string, unknown> = {};
  if (modo === "create" || "nombre" in body) {
    const nombre = str(body.nombre);
    if (!nombre) return { error: "Escribe el nombre del insumo." };
    out.nombre = nombre;
  }
  if ("unidad" in body) out.unidad = str(body.unidad) ?? "pza";
  if (modo === "create" && !("unidad" in body)) out.unidad = "pza";
  if ("costo_unitario" in body) out.costo_unitario = num(body.costo_unitario);
  if ("stock_actual" in body) out.stock_actual = num(body.stock_actual);
  if ("stock_minimo" in body) out.stock_minimo = num(body.stock_minimo);
  return { data: out };
}

/** Un renglón nuevo para una orden (producto + cantidad + nota). */
export function sanitizeItem(body: Record<string, unknown>) {
  const nombre = str(body.nombre);
  if (!nombre) return { error: "Falta el producto." };
  return {
    data: {
      producto_id: str(body.producto_id),
      nombre,
      precio_unit: num(body.precio_unit),
      cantidad: posInt(body.cantidad),
      nota: str(body.nota),
    },
  };
}
