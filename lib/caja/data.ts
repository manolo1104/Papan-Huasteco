import { createAdminClient, adminEnvReady } from "@/lib/supabase/admin";
import { todayISO, addDays, mesActual } from "./server";
import type {
  Turno,
  Gasto,
  Evento,
  Categoria,
  Producto,
  Mesa,
  Orden,
  OrdenItem,
  Insumo,
  Receta,
  ProductoCosteo,
} from "./types";
import { CATEGORIAS_DEFAULT } from "./types";

// Cargadores de datos para las páginas del panel (server components).
// Todos verifican que Supabase esté configurado; si no, devuelven vacío para
// que el panel muestre el aviso de "configura Supabase" sin romperse.

const sum = <T,>(rows: T[], pick: (r: T) => number): number =>
  rows.reduce((acc, r) => acc + (pick(r) || 0), 0);

export interface DashboardData {
  hoy: { ingresos: number; efectivo: number; tarjeta: number; gastos: number; utilidad: number };
  semana: { ingresos: number; gastos: number; utilidad: number };
  mes: { ingresos: number; gastos: number; utilidad: number; faltantes: number };
  gastosPorCategoria: { categoria: string; total: number }[];
  turnosRecientes: Turno[];
  eventosPendientes: Evento[];
  turnoAbierto: Turno | null;
  mesAnterior: { ingresos: number; gastos: number; utilidad: number };
  meta: number;
  mejorDia: { fecha: string; total: number } | null;
  mejorTurno: { turno: string; total: number } | null;
}

export async function loadDashboard(): Promise<DashboardData | null> {
  if (!adminEnvReady) return null;
  const sb = createAdminClient();
  const hoy = todayISO();
  const inicioMes = hoy.slice(0, 8) + "01";
  const inicioSemana = addDays(hoy, -6);

  const mes = mesActual();
  const finMesAnt = addDays(inicioMes, -1);
  const inicioMesAnt = finMesAnt.slice(0, 8) + "01";

  const [turnosRes, gastosRes, eventosRes, recientesRes, turnosAntRes, gastosAntRes, metaRes] =
    await Promise.all([
      sb.from("caja_turnos").select("*").gte("fecha", inicioMes),
      sb.from("caja_gastos").select("*").gte("fecha", inicioMes),
      sb.from("eventos").select("*").order("fecha", { ascending: true }),
      sb.from("caja_turnos").select("*").order("fecha", { ascending: false }).order("created_at", { ascending: false }).limit(8),
      sb.from("caja_turnos").select("total_ingresos, fecha").gte("fecha", inicioMesAnt).lte("fecha", finMesAnt),
      sb.from("caja_gastos").select("monto").gte("fecha", inicioMesAnt).lte("fecha", finMesAnt),
      sb.from("caja_metas").select("meta_ventas").eq("mes", mes).maybeSingle(),
    ]);

  const turnos = (turnosRes.data as Turno[]) ?? [];
  const gastos = (gastosRes.data as Gasto[]) ?? [];
  const eventos = (eventosRes.data as Evento[]) ?? [];
  const turnosRecientes = (recientesRes.data as Turno[]) ?? [];
  const turnosAnt = (turnosAntRes.data as { total_ingresos: number }[]) ?? [];
  const gastosAnt = (gastosAntRes.data as { monto: number }[]) ?? [];
  const metaVentas = (metaRes.data as { meta_ventas: number } | null)?.meta_ventas ?? 0;

  const tHoy = turnos.filter((t) => t.fecha === hoy);
  const tSemana = turnos.filter((t) => t.fecha >= inicioSemana);
  const gHoy = gastos.filter((g) => g.fecha === hoy);
  const gSemana = gastos.filter((g) => g.fecha >= inicioSemana);

  const ingHoy = sum(tHoy, (t) => t.total_ingresos);
  const gasHoy = sum(gHoy, (g) => g.monto);
  const ingSemana = sum(tSemana, (t) => t.total_ingresos);
  const gasSemana = sum(gSemana, (g) => g.monto);
  const ingMes = sum(turnos, (t) => t.total_ingresos);
  const gasMes = sum(gastos, (g) => g.monto);
  const faltantes = sum(
    turnos.filter((t) => t.diferencia < 0),
    (t) => Math.abs(t.diferencia)
  );

  const ingMesAnt = sum(turnosAnt, (t) => t.total_ingresos);
  const gasMesAnt = sum(gastosAnt, (g) => g.monto);

  const porDia = new Map<string, number>();
  for (const t of turnos) porDia.set(t.fecha, (porDia.get(t.fecha) || 0) + t.total_ingresos);
  let mejorDia: { fecha: string; total: number } | null = null;
  for (const [fecha, total] of Array.from(porDia))
    if (total > 0 && (!mejorDia || total > mejorDia.total)) mejorDia = { fecha, total };

  const porTurnoTipo = new Map<string, number>();
  for (const t of turnos) porTurnoTipo.set(t.turno, (porTurnoTipo.get(t.turno) || 0) + t.total_ingresos);
  let mejorTurno: { turno: string; total: number } | null = null;
  for (const [turno, total] of Array.from(porTurnoTipo))
    if (total > 0 && (!mejorTurno || total > mejorTurno.total)) mejorTurno = { turno, total };

  const porCat = new Map<string, number>();
  for (const g of gastos) porCat.set(g.categoria, (porCat.get(g.categoria) || 0) + g.monto);
  const gastosPorCategoria = Array.from(porCat.entries())
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);

  const eventosPendientes = eventos.filter(
    (e) => e.estado !== "cancelado" && e.total_acordado - e.pagado > 0.5
  );

  const turnoAbierto = turnosRecientes.find((t) => t.estado === "abierto") ?? null;

  return {
    hoy: { ingresos: ingHoy, efectivo: sum(tHoy, (t) => t.ventas_efectivo), tarjeta: sum(tHoy, (t) => t.ventas_tarjeta), gastos: gasHoy, utilidad: ingHoy - gasHoy },
    semana: { ingresos: ingSemana, gastos: gasSemana, utilidad: ingSemana - gasSemana },
    mes: { ingresos: ingMes, gastos: gasMes, utilidad: ingMes - gasMes, faltantes },
    gastosPorCategoria,
    turnosRecientes,
    eventosPendientes,
    turnoAbierto,
    mesAnterior: { ingresos: ingMesAnt, gastos: gasMesAnt, utilidad: ingMesAnt - gasMesAnt },
    meta: metaVentas,
    mejorDia,
    mejorTurno,
  };
}

/** Turno actualmente abierto (para enlazar gastos y mostrar "cerrar turno"). */
export async function loadTurnoAbierto(): Promise<Turno | null> {
  if (!adminEnvReady) return null;
  const sb = createAdminClient();
  const { data } = await sb
    .from("caja_turnos")
    .select("*")
    .eq("estado", "abierto")
    .order("created_at", { ascending: false })
    .limit(1);
  return ((data as Turno[]) ?? [])[0] ?? null;
}

export async function loadTurnos(desde?: string, hasta?: string): Promise<Turno[]> {
  if (!adminEnvReady) return [];
  const sb = createAdminClient();
  let q = sb.from("caja_turnos").select("*");
  if (desde) q = q.gte("fecha", desde);
  if (hasta) q = q.lte("fecha", hasta);
  const { data } = await q
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(300);
  return (data as Turno[]) ?? [];
}

export async function loadGastos(desde?: string, hasta?: string): Promise<Gasto[]> {
  if (!adminEnvReady) return [];
  const sb = createAdminClient();
  let q = sb.from("caja_gastos").select("*");
  if (desde) q = q.gte("fecha", desde);
  if (hasta) q = q.lte("fecha", hasta);
  const { data } = await q
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);
  return (data as Gasto[]) ?? [];
}

/** Suma de gastos en efectivo ligados a un turno (para previsualizar el corte). */
export async function sumaGastosEfectivoTurno(turnoId: string): Promise<number> {
  if (!adminEnvReady) return 0;
  const sb = createAdminClient();
  const { data } = await sb
    .from("caja_gastos")
    .select("monto")
    .eq("turno_id", turnoId)
    .eq("forma_pago", "efectivo");
  return (data ?? []).reduce(
    (a, g) => a + Number((g as { monto: unknown }).monto || 0),
    0
  );
}

export async function loadEventos(): Promise<Evento[]> {
  if (!adminEnvReady) return [];
  const sb = createAdminClient();
  const { data } = await sb
    .from("eventos")
    .select("*")
    .order("fecha", { ascending: true, nullsFirst: false })
    .limit(300);
  return (data as Evento[]) ?? [];
}

// ── Fase 2 ────────────────────────────────────────────────────

/** Categorías de gasto (de la BD; respaldo a las default si aún no hay tabla). */
export async function loadCategorias(): Promise<Categoria[]> {
  if (!adminEnvReady) return CATEGORIAS_DEFAULT;
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("caja_categorias")
    .select("*")
    .order("orden", { ascending: true });
  const rows = (data as Categoria[]) ?? [];
  if (error || rows.length === 0) return CATEGORIAS_DEFAULT;
  return rows;
}

/** Meta de ventas (MXN) de un mes 'YYYY-MM'; 0 si no se ha fijado. */
export async function loadMeta(mes: string): Promise<number> {
  if (!adminEnvReady) return 0;
  const sb = createAdminClient();
  const { data } = await sb
    .from("caja_metas")
    .select("meta_ventas")
    .eq("mes", mes)
    .maybeSingle();
  return (data as { meta_ventas: number } | null)?.meta_ventas ?? 0;
}

export interface ResumenDia {
  fecha: string;
  turnos: Turno[];
  gastos: Gasto[];
  eventos: Evento[];
  ingresos: number;
  efectivo: number;
  tarjeta: number;
  gastosTotal: number;
  utilidad: number;
  faltantes: number;
  cobrosEventos: number;
}

/** Cierre de un día: turnos, gastos, eventos y totales. */
export async function loadResumenDia(fecha: string): Promise<ResumenDia | null> {
  if (!adminEnvReady) return null;
  const sb = createAdminClient();
  const [tRes, gRes, eRes] = await Promise.all([
    sb.from("caja_turnos").select("*").eq("fecha", fecha).order("created_at", { ascending: true }),
    sb.from("caja_gastos").select("*").eq("fecha", fecha).order("created_at", { ascending: true }),
    sb.from("eventos").select("*").eq("fecha", fecha),
  ]);
  const turnos = (tRes.data as Turno[]) ?? [];
  const gastos = (gRes.data as Gasto[]) ?? [];
  const eventos = (eRes.data as Evento[]) ?? [];
  const ingresos = sum(turnos, (t) => t.total_ingresos);
  const gastosTotal = sum(gastos, (g) => g.monto);
  return {
    fecha,
    turnos,
    gastos,
    eventos,
    ingresos,
    efectivo: sum(turnos, (t) => t.ventas_efectivo),
    tarjeta: sum(turnos, (t) => t.ventas_tarjeta),
    gastosTotal,
    utilidad: ingresos - gastosTotal,
    faltantes: sum(turnos.filter((t) => t.diferencia < 0), (t) => Math.abs(t.diferencia)),
    cobrosEventos: sum(eventos, (e) => e.pagado),
  };
}

export interface Tendencia {
  mes: string;
  porDia: { fecha: string; ingresos: number }[];
  porDiaSemana: { dow: number; total: number }[];
  porTurno: { turno: string; total: number }[];
  maxDia: number;
}

/** Serie de ventas por día del mes + agregados por día de semana y por turno. */
export async function loadTendencia(mes: string): Promise<Tendencia> {
  const vacio: Tendencia = { mes, porDia: [], porDiaSemana: [], porTurno: [], maxDia: 0 };
  if (!adminEnvReady) return vacio;
  const sb = createAdminClient();
  const inicio = mes + "-01";
  const fin = addDays(addDays(inicio, 32).slice(0, 8) + "01", -1); // último día del mes
  const { data } = await sb
    .from("caja_turnos")
    .select("fecha, turno, total_ingresos")
    .gte("fecha", inicio)
    .lte("fecha", fin);
  const rows = (data as { fecha: string; turno: string; total_ingresos: number }[]) ?? [];

  const porDiaMap = new Map<string, number>();
  const dowMap = new Map<number, number>();
  const turnoMap = new Map<string, number>();
  for (const r of rows) {
    porDiaMap.set(r.fecha, (porDiaMap.get(r.fecha) || 0) + r.total_ingresos);
    const [y, m, d] = r.fecha.split("-").map(Number);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    dowMap.set(dow, (dowMap.get(dow) || 0) + r.total_ingresos);
    turnoMap.set(r.turno, (turnoMap.get(r.turno) || 0) + r.total_ingresos);
  }
  const porDia = Array.from(porDiaMap.entries())
    .map(([fecha, ingresos]) => ({ fecha, ingresos }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  const porDiaSemana = Array.from(dowMap.entries())
    .map(([dow, total]) => ({ dow, total }))
    .sort((a, b) => a.dow - b.dow);
  const porTurno = Array.from(turnoMap.entries())
    .map(([turno, total]) => ({ turno, total }))
    .sort((a, b) => b.total - a.total);
  const maxDia = Math.max(0, ...porDia.map((p) => p.ingresos));
  return { mes, porDia, porDiaSemana, porTurno, maxDia };
}

// ── Fase 3: POS, cocina, inventario ───────────────────────────

export async function loadProductos(soloDisponibles = false): Promise<Producto[]> {
  if (!adminEnvReady) return [];
  const sb = createAdminClient();
  let q = sb.from("pos_productos").select("*");
  if (soloDisponibles) q = q.eq("disponible", true);
  const { data } = await q.order("orden", { ascending: true }).order("nombre", { ascending: true });
  return (data as Producto[]) ?? [];
}

export async function loadMesas(): Promise<Mesa[]> {
  if (!adminEnvReady) return [];
  const sb = createAdminClient();
  const { data } = await sb
    .from("pos_mesas")
    .select("*")
    .order("orden", { ascending: true });
  return (data as Mesa[]) ?? [];
}

/** Órdenes abiertas (para pintar qué mesas están ocupadas). */
export async function loadOrdenesAbiertas(): Promise<Orden[]> {
  if (!adminEnvReady) return [];
  const sb = createAdminClient();
  const { data } = await sb
    .from("pos_ordenes")
    .select("*")
    .eq("estado", "abierta")
    .order("created_at", { ascending: true });
  return (data as Orden[]) ?? [];
}

/** La orden abierta de una mesa + sus renglones (para el POS). */
export async function loadOrdenDeMesa(
  mesa: string
): Promise<{ orden: Orden; items: OrdenItem[] } | null> {
  if (!adminEnvReady) return null;
  const sb = createAdminClient();
  const { data: ord } = await sb
    .from("pos_ordenes")
    .select("*")
    .eq("mesa_nombre", mesa)
    .eq("estado", "abierta")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!ord) return null;
  const orden = ord as Orden;
  const { data: items } = await sb
    .from("pos_orden_items")
    .select("*")
    .eq("orden_id", orden.id)
    .order("created_at", { ascending: true });
  return { orden, items: (items as OrdenItem[]) ?? [] };
}

export interface ComandaCocina {
  orden_id: string;
  mesa_nombre: string;
  mesero: string | null;
  creada: string;
  items: OrdenItem[];
}

/** Comandas para la pantalla de cocina: items enviados y aún pendientes. */
export async function loadCocina(): Promise<ComandaCocina[]> {
  if (!adminEnvReady) return [];
  const sb = createAdminClient();
  const { data: items } = await sb
    .from("pos_orden_items")
    .select("*")
    .eq("enviado_cocina", true)
    .eq("estado", "pendiente")
    .order("created_at", { ascending: true });
  const rows = (items as OrdenItem[]) ?? [];
  if (rows.length === 0) return [];

  const ordenIds = Array.from(new Set(rows.map((i) => i.orden_id)));
  const { data: ordenes } = await sb
    .from("pos_ordenes")
    .select("id, mesa_nombre, mesero, created_at")
    .in("id", ordenIds);
  const info = new Map(
    ((ordenes as { id: string; mesa_nombre: string; mesero: string | null; created_at: string }[]) ?? []).map(
      (o) => [o.id, o]
    )
  );

  const porOrden = new Map<string, ComandaCocina>();
  for (const it of rows) {
    if (!porOrden.has(it.orden_id)) {
      const o = info.get(it.orden_id);
      porOrden.set(it.orden_id, {
        orden_id: it.orden_id,
        mesa_nombre: o?.mesa_nombre ?? "—",
        mesero: o?.mesero ?? null,
        creada: o?.created_at ?? it.created_at,
        items: [],
      });
    }
    porOrden.get(it.orden_id)!.items.push(it);
  }
  return Array.from(porOrden.values()).sort((a, b) => a.creada.localeCompare(b.creada));
}

export async function loadInsumos(): Promise<Insumo[]> {
  if (!adminEnvReady) return [];
  const sb = createAdminClient();
  const { data } = await sb
    .from("pos_insumos")
    .select("*")
    .order("nombre", { ascending: true });
  return (data as Insumo[]) ?? [];
}

export async function loadRecetas(productoId: string): Promise<Receta[]> {
  if (!adminEnvReady) return [];
  const sb = createAdminClient();
  const { data } = await sb
    .from("pos_recetas")
    .select("*")
    .eq("producto_id", productoId);
  return (data as Receta[]) ?? [];
}

/** Productos con su costo (de la receta) y margen calculados. */
export async function loadCosteo(): Promise<ProductoCosteo[]> {
  if (!adminEnvReady) return [];
  const sb = createAdminClient();
  const [productos, recetas, insumos] = await Promise.all([
    loadProductos(),
    sb.from("pos_recetas").select("*").then((r) => (r.data as Receta[]) ?? []),
    loadInsumos(),
  ]);
  const costoUnit = new Map(insumos.map((i) => [i.id, i.costo_unitario]));
  const porProducto = new Map<string, Receta[]>();
  for (const r of recetas) {
    if (!porProducto.has(r.producto_id)) porProducto.set(r.producto_id, []);
    porProducto.get(r.producto_id)!.push(r);
  }
  return productos.map((p) => {
    const recs = porProducto.get(p.id) ?? [];
    const costo = recs.reduce((a, r) => a + r.cantidad * (costoUnit.get(r.insumo_id) ?? 0), 0);
    return { ...p, costo, margen: p.precio - costo, tieneReceta: recs.length > 0 };
  });
}

/** Insumos por debajo (o en) su mínimo, para alertas. */
export async function loadStockBajo(): Promise<Insumo[]> {
  const insumos = await loadInsumos();
  return insumos.filter((i) => i.stock_minimo > 0 && i.stock_actual <= i.stock_minimo);
}

/** Todas las recetas agrupadas por producto (para el editor de recetas). */
export async function loadTodasRecetas(): Promise<Record<string, Receta[]>> {
  if (!adminEnvReady) return {};
  const sb = createAdminClient();
  const { data } = await sb.from("pos_recetas").select("*");
  const out: Record<string, Receta[]> = {};
  for (const r of (data as Receta[]) ?? []) {
    (out[r.producto_id] ??= []).push(r);
  }
  return out;
}
