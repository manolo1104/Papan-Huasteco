import Link from "next/link";
import type { Rol } from "@/lib/caja/auth";
import type { DashboardData, PuntoSerie, TopPlatillo } from "@/lib/caja/data";
import { TURNOS, labelDe, type Categoria } from "@/lib/caja/types";
import { todayISO } from "@/lib/caja/server";
import { mxn, mxnCorto, fechaCorta, fechaLarga } from "@/lib/caja/format";
import AreaChart from "@/components/caja/charts/AreaChart";
import RankList from "@/components/caja/charts/RankList";
import { Icon } from "@/components/caja/ui/Icon";

interface MetricasDash {
  serie30: PuntoSerie[];
  cuentas: number;
  ticketPromedio: number;
  topVendidos: TopPlatillo[];
}

function Kpi({
  label,
  valor,
  tono,
  pista,
}: {
  label: string;
  valor: string;
  tono?: "verde" | "rojo" | "neutro";
  pista?: string;
}) {
  return (
    <div className={`caja-kpi caja-kpi--${tono ?? "neutro"}`}>
      <span className="caja-kpi__label">{label}</span>
      <span className="caja-kpi__valor">{valor}</span>
      {pista && <span className="caja-kpi__pista">{pista}</span>}
    </div>
  );
}

function TurnoAbiertoBanner({ data }: { data: DashboardData }) {
  if (!data.turnoAbierto) return null;
  const t = data.turnoAbierto;
  return (
    <Link href="/admin/turnos" className="caja-banner">
      <span className="caja-banner__dot" />
      <div>
        <strong>Hay un turno abierto</strong> — {labelDe([...TURNOS], t.turno)}{" "}
        del {fechaCorta(t.fecha)}. Toca para cerrarlo y hacer el corte.
      </div>
    </Link>
  );
}

function ComparRow({
  label,
  prev,
  now,
  invert,
}: {
  label: string;
  prev: number;
  now: number;
  invert?: boolean;
}) {
  const d = prev !== 0 ? Math.round(((now - prev) / Math.abs(prev)) * 100) : null;
  const good = invert ? now <= prev : now >= prev;
  return (
    <tr>
      <td>{label}</td>
      <td className="num">{mxnCorto(prev)}</td>
      <td className="num">{mxnCorto(now)}</td>
      <td className={`num ${d === null ? "" : good ? "pos" : "neg"}`}>
        {d === null ? "—" : `${d > 0 ? "▲" : d < 0 ? "▼" : ""} ${Math.abs(d)}%`}
      </td>
    </tr>
  );
}

function MetasComparativo({ data }: { data: DashboardData }) {
  const pct = data.meta > 0 ? Math.min(100, Math.round((data.mes.ingresos / data.meta) * 100)) : 0;
  const falta = Math.max(0, data.meta - data.mes.ingresos);
  return (
    <div className="caja-grid2">
      <section className="caja-card">
        <h3 className="caja-card__title">Meta de ventas del mes</h3>
        {data.meta > 0 ? (
          <>
            <div className="caja-meta__head">
              <strong>{mxn(data.mes.ingresos)}</strong>
              <span className="caja-muted">de {mxn(data.meta)}</span>
            </div>
            <div className="caja-bars__track caja-meta__track">
              <div className="caja-meta__fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="caja-muted caja-meta__pie">
              Vas en <strong>{pct}%</strong>
              {falta > 0 ? ` · faltan ${mxn(falta)}` : " · ¡meta cumplida! 🎉"}
            </p>
          </>
        ) : (
          <p className="caja-muted">
            Aún no fijas tu meta del mes. Ponla en{" "}
            <Link href="/admin/ajustes" className="caja-link">Ajustes</Link>.
          </p>
        )}
        <div className="caja-mejores">
          <div>
            <span className="caja-muted">Mejor día</span>
            <strong>{data.mejorDia ? `${fechaCorta(data.mejorDia.fecha)} · ${mxnCorto(data.mejorDia.total)}` : "—"}</strong>
          </div>
          <div>
            <span className="caja-muted">Mejor turno</span>
            <strong>{data.mejorTurno ? `${labelDe([...TURNOS], data.mejorTurno.turno)} · ${mxnCorto(data.mejorTurno.total)}` : "—"}</strong>
          </div>
        </div>
      </section>

      <section className="caja-card">
        <h3 className="caja-card__title">Este mes vs. el anterior</h3>
        <table className="caja-table">
          <thead>
            <tr>
              <th></th>
              <th className="num">Mes pasado</th>
              <th className="num">Este mes</th>
              <th className="num">Cambio</th>
            </tr>
          </thead>
          <tbody>
            <ComparRow label="Ingresos" prev={data.mesAnterior.ingresos} now={data.mes.ingresos} />
            <ComparRow label="Gastos" prev={data.mesAnterior.gastos} now={data.mes.gastos} invert />
            <ComparRow label="Utilidad" prev={data.mesAnterior.utilidad} now={data.mes.utilidad} />
          </tbody>
        </table>
      </section>
    </div>
  );
}

function MetricasDashboard({ m }: { m: MetricasDash }) {
  return (
    <div className="caja-grid2">
      <section className="caja-card">
        <div className="caja-card__head">
          <h3 className="caja-card__title">Ventas · últimos 30 días</h3>
          <Link href="/admin/reportes" className="caja-link">Ver detalle</Link>
        </div>
        <AreaChart serie={m.serie30} id="dash" />
        <div className="caja-kpis caja-kpis--3" style={{ marginTop: "1rem" }}>
          <Kpi label="Cuentas del mes" valor={m.cuentas > 0 ? String(m.cuentas) : "—"} />
          <Kpi label="Ticket promedio" valor={m.ticketPromedio > 0 ? mxn(m.ticketPromedio) : "—"} tono="verde" />
          <Kpi label="Venta 30 días" valor={mxnCorto(m.serie30.reduce((a, p) => a + p.total, 0))} />
        </div>
      </section>

      <section className="caja-card">
        <div className="caja-card__head">
          <h3 className="caja-card__title">Platillos más vendidos</h3>
          <span className="caja-muted">este mes</span>
        </div>
        <RankList
          items={m.topVendidos}
          modo="vendidos"
          emptyHint="Cuando empiecen a cobrar pedidos en el POS, aquí verás lo que más se vende."
        />
      </section>
    </div>
  );
}

export default function Dashboard({
  rol,
  data,
  categorias,
  metricas,
}: {
  rol: Rol;
  data: DashboardData | null;
  categorias: Categoria[];
  metricas?: MetricasDash;
}) {
  if (!data) {
    return (
      <div className="caja-empty">
        <h2>Falta conectar la base de datos</h2>
        <p>
          El panel está listo, pero todavía no se configura Supabase. Sigue los
          pasos del archivo <code>.env.example</code> (crear proyecto, pegar el
          SQL y poner las llaves). En cuanto estén, aquí verás tus números.
        </p>
      </div>
    );
  }

  const t = data.turnoAbierto;

  // ── Vista de la encargada ───────────────────────────────────
  if (rol === "operador") {
    return (
      <div className="caja-page">
        <header className="caja-head">
          <h1>Hola 👋</h1>
          <p className="caja-head__sub">{fechaLarga(todayISO())}</p>
        </header>

        <TurnoAbiertoBanner data={data} />

        <div className="caja-actions">
          <Link href="/admin/turnos" className="caja-action">
            <span className="caja-action__icon"><Icon name="turnos" size={26} /></span>
            <span className="caja-action__t">
              {t ? "Cerrar turno" : "Abrir turno"}
            </span>
            <span className="caja-action__d">
              {t ? "Captura ventas y cuenta el efectivo" : "Empieza el corte del turno"}
            </span>
          </Link>
          <Link href="/admin/gastos" className="caja-action">
            <span className="caja-action__icon"><Icon name="gastos" size={26} /></span>
            <span className="caja-action__t">Registrar gasto</span>
            <span className="caja-action__d">Compras, proveedores, pagos</span>
          </Link>
          <Link href="/admin/eventos" className="caja-action">
            <span className="caja-action__icon"><Icon name="eventos" size={26} /></span>
            <span className="caja-action__t">Eventos</span>
            <span className="caja-action__d">Grupos, anticipos y saldos</span>
          </Link>
        </div>

        <section className="caja-card">
          <h3 className="caja-card__title">Resumen de hoy</h3>
          <div className="caja-kpis caja-kpis--3">
            <Kpi label="Ventas de hoy" valor={mxn(data.hoy.ingresos)} tono="verde" />
            <Kpi label="Efectivo / Tarjeta" valor={`${mxnCorto(data.hoy.efectivo)} / ${mxnCorto(data.hoy.tarjeta)}`} />
            <Kpi label="Gastos de hoy" valor={mxn(data.hoy.gastos)} tono="rojo" />
          </div>
        </section>
      </div>
    );
  }

  // ── Vista del dueño ─────────────────────────────────────────
  const maxCat = Math.max(1, ...data.gastosPorCategoria.map((g) => g.total));

  return (
    <div className="caja-page">
      <header className="caja-head caja-head--row">
        <div>
          <h1>Tablero financiero</h1>
          <p className="caja-head__sub">{fechaLarga(todayISO())}</p>
        </div>
        <div className="caja-head__cta">
          <Link href="/admin/turnos" className="caja-btn caja-btn--primary">
            {t ? "Cerrar turno" : "Abrir turno"}
          </Link>
          <Link href="/admin/reportes" className="caja-btn caja-btn--ghost">
            Reportes
          </Link>
        </div>
      </header>

      <TurnoAbiertoBanner data={data} />

      <div className="caja-kpis caja-kpis--4">
        <Kpi label="Ingresos de hoy" valor={mxn(data.hoy.ingresos)} tono="verde" pista={`${mxnCorto(data.hoy.efectivo)} efectivo · ${mxnCorto(data.hoy.tarjeta)} tarjeta`} />
        <Kpi label="Gastos de hoy" valor={mxn(data.hoy.gastos)} tono="rojo" />
        <Kpi label="Utilidad de hoy" valor={mxn(data.hoy.utilidad)} tono={data.hoy.utilidad >= 0 ? "verde" : "rojo"} />
        <Kpi label="Faltantes del mes" valor={mxn(data.mes.faltantes)} tono={data.mes.faltantes > 0 ? "rojo" : "neutro"} pista={data.mes.faltantes > 0 ? "Revisa los cortes" : "Sin faltantes 👌"} />
      </div>

      {metricas && <MetricasDashboard m={metricas} />}

      <MetasComparativo data={data} />

      <div className="caja-grid2">
        <section className="caja-card">
          <h3 className="caja-card__title">Esta semana</h3>
          <div className="caja-kpis caja-kpis--3">
            <Kpi label="Ingresos" valor={mxn(data.semana.ingresos)} />
            <Kpi label="Gastos" valor={mxn(data.semana.gastos)} />
            <Kpi label="Utilidad" valor={mxn(data.semana.utilidad)} tono={data.semana.utilidad >= 0 ? "verde" : "rojo"} />
          </div>
          <h3 className="caja-card__title caja-card__title--mt">Este mes</h3>
          <div className="caja-kpis caja-kpis--3">
            <Kpi label="Ingresos" valor={mxn(data.mes.ingresos)} />
            <Kpi label="Gastos" valor={mxn(data.mes.gastos)} />
            <Kpi label="Utilidad" valor={mxn(data.mes.utilidad)} tono={data.mes.utilidad >= 0 ? "verde" : "rojo"} />
          </div>
        </section>

        <section className="caja-card">
          <h3 className="caja-card__title">Gastos del mes por categoría</h3>
          {data.gastosPorCategoria.length === 0 ? (
            <p className="caja-muted">Sin gastos registrados este mes.</p>
          ) : (
            <ul className="caja-bars">
              {data.gastosPorCategoria.map((g) => (
                <li key={g.categoria}>
                  <div className="caja-bars__row">
                    <span>{labelDe(categorias, g.categoria)}</span>
                    <strong>{mxn(g.total)}</strong>
                  </div>
                  <div className="caja-bars__track">
                    <div
                      className="caja-bars__fill"
                      style={{ width: `${(g.total / maxCat) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="caja-grid2">
        <section className="caja-card">
          <div className="caja-card__head">
            <h3 className="caja-card__title">Turnos recientes</h3>
            <Link href="/admin/turnos" className="caja-link">Ver todos</Link>
          </div>
          {data.turnosRecientes.length === 0 ? (
            <p className="caja-muted">Aún no hay turnos registrados.</p>
          ) : (
            <table className="caja-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Turno</th>
                  <th className="num">Ingresos</th>
                  <th className="num">Dif.</th>
                </tr>
              </thead>
              <tbody>
                {data.turnosRecientes.map((tr) => (
                  <tr key={tr.id}>
                    <td>{fechaCorta(tr.fecha)}</td>
                    <td>
                      {tr.turno}
                      {tr.estado === "abierto" && <span className="caja-tag caja-tag--abierto">abierto</span>}
                    </td>
                    <td className="num">{mxnCorto(tr.total_ingresos)}</td>
                    <td className={`num ${tr.diferencia < 0 ? "neg" : tr.diferencia > 0 ? "pos" : ""}`}>
                      {tr.estado === "cerrado" ? mxnCorto(tr.diferencia) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="caja-card">
          <div className="caja-card__head">
            <h3 className="caja-card__title">Eventos con saldo</h3>
            <Link href="/admin/eventos" className="caja-link">Ver todos</Link>
          </div>
          {data.eventosPendientes.length === 0 ? (
            <p className="caja-muted">No hay eventos con saldo pendiente.</p>
          ) : (
            <ul className="caja-list">
              {data.eventosPendientes.slice(0, 6).map((e) => (
                <li key={e.id} className="caja-list__row">
                  <div>
                    <strong>{e.cliente_nombre}</strong>
                    <span className="caja-muted"> · {fechaCorta(e.fecha)}</span>
                  </div>
                  <span className="caja-saldo">{mxn(e.total_acordado - e.pagado)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
