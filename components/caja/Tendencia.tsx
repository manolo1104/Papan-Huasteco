import { TURNOS, labelDe } from "@/lib/caja/types";
import { mxn, mxnCorto, fechaCorta } from "@/lib/caja/format";
import type { Tendencia as TData } from "@/lib/caja/data";

const DOW = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function Tendencia({ data }: { data: TData }) {
  if (data.porDia.length === 0) {
    return <p className="caja-muted">Sin ventas registradas este mes.</p>;
  }
  const maxDow = Math.max(1, ...data.porDiaSemana.map((d) => d.total));
  const maxTurno = Math.max(1, ...data.porTurno.map((t) => t.total));

  return (
    <div className="caja-tend">
      <div className="caja-tend__chart">
        {data.porDia.map((p) => (
          <div
            key={p.fecha}
            className="caja-tend__col"
            title={`${fechaCorta(p.fecha)}: ${mxn(p.ingresos)}`}
          >
            <div
              className="caja-tend__bar"
              style={{ height: `${data.maxDia > 0 ? (p.ingresos / data.maxDia) * 100 : 0}%` }}
            />
            <span className="caja-tend__x">{p.fecha.slice(8)}</span>
          </div>
        ))}
      </div>

      <div className="caja-grid2">
        <div>
          <h4 className="caja-tend__h">Mejores días de la semana</h4>
          <ul className="caja-bars">
            {data.porDiaSemana.map((d) => (
              <li key={d.dow}>
                <div className="caja-bars__row">
                  <span>{DOW[d.dow]}</span>
                  <strong>{mxnCorto(d.total)}</strong>
                </div>
                <div className="caja-bars__track">
                  <div className="caja-bars__fill" style={{ width: `${(d.total / maxDow) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="caja-tend__h">Ventas por turno</h4>
          <ul className="caja-bars">
            {data.porTurno.map((t) => (
              <li key={t.turno}>
                <div className="caja-bars__row">
                  <span>{labelDe([...TURNOS], t.turno)}</span>
                  <strong>{mxnCorto(t.total)}</strong>
                </div>
                <div className="caja-bars__track">
                  <div className="caja-bars__fill" style={{ width: `${(t.total / maxTurno) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
