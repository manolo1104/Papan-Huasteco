import { mxnCorto } from "@/lib/caja/format";
import type { TopPlatillo } from "@/lib/caja/data";

// Ranking de platillos con barra de progreso. modo:
//  "vendidos"  -> ordena/mide por cantidad
//  "rentables" -> ordena/mide por ganancia
export default function RankList({
  items,
  modo,
  emptyHint,
}: {
  items: TopPlatillo[];
  modo: "vendidos" | "rentables";
  emptyHint?: string;
}) {
  if (items.length === 0) {
    return <p className="caja-muted">{emptyHint ?? "Aún no hay datos."}</p>;
  }
  const valor = (t: TopPlatillo) => (modo === "vendidos" ? t.cantidad : t.ganancia);
  const max = Math.max(1, ...items.map(valor));

  return (
    <ol className="caja-rank">
      {items.map((t, i) => (
        <li key={(t.producto_id ?? t.nombre) + i} className="caja-rank__row">
          <span className="caja-rank__num">{i + 1}</span>
          <div className="caja-rank__body">
            <div className="caja-rank__head">
              <span className="caja-rank__nombre">{t.nombre}</span>
              <strong>
                {modo === "vendidos"
                  ? `${t.cantidad} vend.`
                  : mxnCorto(t.ganancia)}
              </strong>
            </div>
            <div className="caja-rank__track">
              <div className="caja-rank__fill" style={{ width: `${(valor(t) / max) * 100}%` }} />
            </div>
            <span className="caja-rank__sub">
              {modo === "vendidos"
                ? `${mxnCorto(t.ingresos)} en ventas`
                : `${t.cantidad} vendidos · ${mxnCorto(t.ingresos)}`}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
