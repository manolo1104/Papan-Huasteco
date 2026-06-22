import { mxn } from "@/lib/caja/format";

// Estado de resultados (P&L) simple y legible: ingresos − egresos = utilidad.
// Es una función pura (sirve en servidor). Envuélvelo en una <section caja-card>.

export interface EstadoResultadosData {
  ingresos: { efectivo: number; tarjeta: number; otros: number; total: number };
  gastos: { label: string; total: number }[];
  totalGastos: number;
  utilidad: number;
}

export default function EstadoResultados({
  ingresos,
  gastos,
  totalGastos,
  utilidad,
}: EstadoResultadosData) {
  const margen = ingresos.total > 0 ? Math.round((utilidad / ingresos.total) * 100) : 0;
  const pos = utilidad >= 0;

  return (
    <div className="caja-er">
      <div className="caja-er__sec">
        <div className="caja-er__h">Ingresos (ventas)</div>
        <ul className="caja-er__list">
          <li><span>Ventas en efectivo</span><span>{mxn(ingresos.efectivo)}</span></li>
          <li><span>Ventas con tarjeta</span><span>{mxn(ingresos.tarjeta)}</span></li>
          {ingresos.otros > 0 && (
            <li><span>Otros ingresos</span><span>{mxn(ingresos.otros)}</span></li>
          )}
        </ul>
        <div className="caja-er__sub">
          <span>Total de ingresos</span>
          <strong>{mxn(ingresos.total)}</strong>
        </div>
      </div>

      <div className="caja-er__sec">
        <div className="caja-er__h">Egresos (gastos)</div>
        {gastos.length === 0 ? (
          <p className="caja-muted caja-er__vacio">Sin gastos en el periodo.</p>
        ) : (
          <ul className="caja-er__list">
            {gastos.map((g) => (
              <li key={g.label}><span>{g.label}</span><span>−{mxn(g.total)}</span></li>
            ))}
          </ul>
        )}
        <div className="caja-er__sub">
          <span>Total de egresos</span>
          <strong>−{mxn(totalGastos)}</strong>
        </div>
      </div>

      <div className={`caja-er__total ${pos ? "is-pos" : "is-neg"}`}>
        <span>Utilidad {pos ? "(ganancia)" : "(pérdida)"}</span>
        <strong>{mxn(utilidad)}</strong>
      </div>
      <div className="caja-er__margen">
        Margen: <strong>{margen}%</strong> sobre las ventas
      </div>
    </div>
  );
}
