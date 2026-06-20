import { TURNOS, labelDe, type Categoria } from "@/lib/caja/types";
import { mxn, mxnCorto, fechaLarga } from "@/lib/caja/format";
import type { ResumenDia as RData } from "@/lib/caja/data";
import { SITE } from "@/lib/site";
import ResumenActions from "./ResumenActions";

function buildTexto(d: RData): string {
  const cerrados = d.turnos.filter((t) => t.estado === "cerrado").length;
  const lineas = [
    `*${SITE.name}* — Resumen del ${fechaLarga(d.fecha)}`,
    `Ventas: ${mxn(d.ingresos)} (efectivo ${mxnCorto(d.efectivo)} · tarjeta ${mxnCorto(d.tarjeta)})`,
    `Gastos: ${mxn(d.gastosTotal)}`,
    `Utilidad: ${mxn(d.utilidad)}`,
  ];
  if (d.faltantes > 0) lineas.push(`Faltantes de caja: ${mxn(d.faltantes)}`);
  if (d.cobrosEventos > 0) lineas.push(`Cobros de eventos: ${mxn(d.cobrosEventos)}`);
  lineas.push(`Turnos cerrados: ${cerrados}`);
  return lineas.join("\n");
}

export default function ResumenDia({
  data,
  fecha,
  categorias,
}: {
  data: RData | null;
  fecha: string;
  categorias: Categoria[];
}) {
  return (
    <div className="caja-page">
      <header className="caja-head caja-head--row">
        <div>
          <h1>Resumen del día</h1>
          <p className="caja-head__sub">{fechaLarga(fecha)}</p>
        </div>
        {data && <ResumenActions texto={buildTexto(data)} />}
      </header>

      <form className="caja-rango caja-noprint" method="get">
        <label className="caja-field">
          <span>Día</span>
          <input type="date" name="fecha" defaultValue={fecha} />
        </label>
        <button className="caja-btn caja-btn--primary caja-btn--sm">Ver</button>
      </form>

      {!data ? (
        <div className="caja-empty">
          <p>Falta conectar la base de datos.</p>
        </div>
      ) : (
        <>
          <div className="caja-kpis caja-kpis--4">
            <div className="caja-kpi caja-kpi--verde">
              <span className="caja-kpi__label">Ventas</span>
              <span className="caja-kpi__valor">{mxn(data.ingresos)}</span>
              <span className="caja-kpi__pista">{mxnCorto(data.efectivo)} efectivo · {mxnCorto(data.tarjeta)} tarjeta</span>
            </div>
            <div className="caja-kpi caja-kpi--rojo">
              <span className="caja-kpi__label">Gastos</span>
              <span className="caja-kpi__valor">{mxn(data.gastosTotal)}</span>
            </div>
            <div className={`caja-kpi caja-kpi--${data.utilidad >= 0 ? "verde" : "rojo"}`}>
              <span className="caja-kpi__label">Utilidad</span>
              <span className="caja-kpi__valor">{mxn(data.utilidad)}</span>
            </div>
            <div className={`caja-kpi caja-kpi--${data.faltantes > 0 ? "rojo" : "neutro"}`}>
              <span className="caja-kpi__label">Faltantes</span>
              <span className="caja-kpi__valor">{mxn(data.faltantes)}</span>
            </div>
          </div>

          <section className="caja-card">
            <h3 className="caja-card__title">Turnos del día</h3>
            {data.turnos.length === 0 ? (
              <p className="caja-muted">Sin turnos este día.</p>
            ) : (
              <div className="caja-table-wrap">
                <table className="caja-table">
                  <thead>
                    <tr>
                      <th>Turno</th>
                      <th>Estado</th>
                      <th className="num">Efectivo</th>
                      <th className="num">Tarjeta</th>
                      <th className="num">Ingresos</th>
                      <th className="num">Dif.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.turnos.map((t) => (
                      <tr key={t.id}>
                        <td>{labelDe([...TURNOS], t.turno)}</td>
                        <td>{t.estado}</td>
                        <td className="num">{t.estado === "cerrado" ? mxnCorto(t.ventas_efectivo) : "—"}</td>
                        <td className="num">{t.estado === "cerrado" ? mxnCorto(t.ventas_tarjeta) : "—"}</td>
                        <td className="num">{t.estado === "cerrado" ? mxnCorto(t.total_ingresos) : "—"}</td>
                        <td className={`num ${t.diferencia < 0 ? "neg" : t.diferencia > 0 ? "pos" : ""}`}>
                          {t.estado === "cerrado" ? mxnCorto(t.diferencia) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="caja-card">
            <h3 className="caja-card__title">Gastos del día</h3>
            {data.gastos.length === 0 ? (
              <p className="caja-muted">Sin gastos este día.</p>
            ) : (
              <div className="caja-table-wrap">
                <table className="caja-table">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Concepto</th>
                      <th>Pago</th>
                      <th className="num">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.gastos.map((g) => (
                      <tr key={g.id}>
                        <td>{labelDe(categorias, g.categoria)}</td>
                        <td>{g.concepto}</td>
                        <td>{g.forma_pago}</td>
                        <td className="num">{mxn(g.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
