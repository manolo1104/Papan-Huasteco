import { TURNOS, GASTO_CATEGORIAS, labelDe, type Turno, type Gasto } from "@/lib/caja/types";
import { mxn, mxnCorto, fechaCorta, fechaLarga } from "@/lib/caja/format";
import ReportesActions from "./ReportesActions";
import Tendencia from "./Tendencia";
import type { Tendencia as TData } from "@/lib/caja/data";

export default function Reportes({
  desde,
  hasta,
  turnos,
  gastos,
  tendencia,
}: {
  desde: string;
  hasta: string;
  turnos: Turno[];
  gastos: Gasto[];
  tendencia: TData;
}) {
  const cerrados = turnos.filter((t) => t.estado === "cerrado");
  const ingresos = cerrados.reduce((a, t) => a + t.total_ingresos, 0);
  const efectivo = cerrados.reduce((a, t) => a + t.ventas_efectivo, 0);
  const tarjeta = cerrados.reduce((a, t) => a + t.ventas_tarjeta, 0);
  const otros = cerrados.reduce((a, t) => a + t.otros_ingresos, 0);
  const totalGastos = gastos.reduce((a, g) => a + g.monto, 0);
  const utilidad = ingresos - totalGastos;
  const faltantes = cerrados
    .filter((t) => t.diferencia < 0)
    .reduce((a, t) => a + Math.abs(t.diferencia), 0);

  const porCat = new Map<string, number>();
  for (const g of gastos) porCat.set(g.categoria, (porCat.get(g.categoria) || 0) + g.monto);
  const gastosPorCat = Array.from(porCat.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="caja-page">
      <header className="caja-head caja-head--row">
        <div>
          <h1>Reportes</h1>
          <p className="caja-head__sub">
            Del {fechaLarga(desde)} al {fechaLarga(hasta)}
          </p>
        </div>
        <ReportesActions desde={desde} hasta={hasta} turnos={turnos} gastos={gastos} />
      </header>

      <form className="caja-rango caja-noprint" method="get">
        <label className="caja-field">
          <span>Desde</span>
          <input type="date" name="desde" defaultValue={desde} />
        </label>
        <label className="caja-field">
          <span>Hasta</span>
          <input type="date" name="hasta" defaultValue={hasta} />
        </label>
        <button className="caja-btn caja-btn--primary caja-btn--sm">Ver</button>
      </form>

      <div className="caja-kpis caja-kpis--4">
        <div className="caja-kpi caja-kpi--verde">
          <span className="caja-kpi__label">Ingresos</span>
          <span className="caja-kpi__valor">{mxn(ingresos)}</span>
          <span className="caja-kpi__pista">{mxnCorto(efectivo)} efectivo · {mxnCorto(tarjeta)} tarjeta{otros > 0 ? ` · ${mxnCorto(otros)} otros` : ""}</span>
        </div>
        <div className="caja-kpi caja-kpi--rojo">
          <span className="caja-kpi__label">Gastos</span>
          <span className="caja-kpi__valor">{mxn(totalGastos)}</span>
        </div>
        <div className={`caja-kpi caja-kpi--${utilidad >= 0 ? "verde" : "rojo"}`}>
          <span className="caja-kpi__label">Utilidad</span>
          <span className="caja-kpi__valor">{mxn(utilidad)}</span>
        </div>
        <div className={`caja-kpi caja-kpi--${faltantes > 0 ? "rojo" : "neutro"}`}>
          <span className="caja-kpi__label">Faltantes de caja</span>
          <span className="caja-kpi__valor">{mxn(faltantes)}</span>
        </div>
      </div>

      <div className="caja-grid2">
        <section className="caja-card">
          <h3 className="caja-card__title">Gastos por categoría</h3>
          {gastosPorCat.length === 0 ? (
            <p className="caja-muted">Sin gastos en este rango.</p>
          ) : (
            <table className="caja-table">
              <tbody>
                {gastosPorCat.map(([cat, total]) => (
                  <tr key={cat}>
                    <td>{labelDe([...GASTO_CATEGORIAS], cat)}</td>
                    <td className="num">{mxn(total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="caja-card">
          <h3 className="caja-card__title">Resumen</h3>
          <table className="caja-table">
            <tbody>
              <tr><td>Turnos cerrados</td><td className="num">{cerrados.length}</td></tr>
              <tr><td>Ticket promedio por turno</td><td className="num">{mxnCorto(cerrados.length ? ingresos / cerrados.length : 0)}</td></tr>
              <tr><td>Gastos registrados</td><td className="num">{gastos.length}</td></tr>
              <tr><td>Margen (utilidad ÷ ingresos)</td><td className="num">{ingresos ? Math.round((utilidad / ingresos) * 100) : 0}%</td></tr>
            </tbody>
          </table>
        </section>
      </div>

      <section className="caja-card">
        <h3 className="caja-card__title">Tendencia del mes</h3>
        <Tendencia data={tendencia} />
      </section>

      <section className="caja-card">
        <h3 className="caja-card__title">Detalle de turnos</h3>
        {cerrados.length === 0 ? (
          <p className="caja-muted">No hay turnos cerrados en este rango.</p>
        ) : (
          <div className="caja-table-wrap">
            <table className="caja-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Turno</th>
                  <th className="num">Efectivo</th>
                  <th className="num">Tarjeta</th>
                  <th className="num">Ingresos</th>
                  <th className="num">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {cerrados.map((t) => (
                  <tr key={t.id}>
                    <td>{fechaCorta(t.fecha)}</td>
                    <td>{labelDe([...TURNOS], t.turno)}</td>
                    <td className="num">{mxnCorto(t.ventas_efectivo)}</td>
                    <td className="num">{mxnCorto(t.ventas_tarjeta)}</td>
                    <td className="num">{mxnCorto(t.total_ingresos)}</td>
                    <td className={`num ${t.diferencia < 0 ? "neg" : t.diferencia > 0 ? "pos" : ""}`}>
                      {mxnCorto(t.diferencia)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
