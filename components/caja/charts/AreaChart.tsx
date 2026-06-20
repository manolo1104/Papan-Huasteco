import { mxnCorto } from "@/lib/caja/format";
import type { PuntoSerie } from "@/lib/caja/data";

// Gráfica de área de ventas, en SVG puro (server-component, sin librerías).
// Línea + relleno con gradiente, líneas guía, etiquetas de ejes y tooltips
// nativos por día (hover sobre cada columna).

const W = 760;
const H = 240;
const PAD_T = 18;
const PAD_B = 30;
const PAD_X = 10;

function fechaDia(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(d)}/${Number(m)}`;
}

export default function AreaChart({
  serie,
  height = 220,
  id = "vt",
}: {
  serie: PuntoSerie[];
  height?: number;
  id?: string;
}) {
  if (serie.length === 0) {
    return <p className="caja-muted">Aún no hay ventas en este periodo.</p>;
  }
  const max = Math.max(1, ...serie.map((p) => p.total));
  const n = serie.length;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_T - PAD_B;
  const x = (i: number) => PAD_X + (n === 1 ? innerW / 2 : (i * innerW) / (n - 1));
  const y = (v: number) => PAD_T + (1 - v / max) * innerH;

  const linePts = serie.map((p, i) => `${x(i).toFixed(1)},${y(p.total).toFixed(1)}`);
  const linePath = "M " + linePts.join(" L ");
  const areaPath = `${linePath} L ${x(n - 1).toFixed(1)},${H - PAD_B} L ${x(0).toFixed(1)},${H - PAD_B} Z`;
  const colW = innerW / n;

  // Etiquetas X: inicio, medio, fin
  const xticks = Array.from(new Set([0, Math.floor((n - 1) / 2), n - 1]));

  return (
    <div className="caja-chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="caja-chart__svg" role="img" aria-label="Ventas por día" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id={`caja-area-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--c-green)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--c-green)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* líneas guía horizontales + etiquetas Y */}
        {[0, 0.5, 1].map((f) => {
          const gy = PAD_T + (1 - f) * innerH;
          return (
            <g key={f}>
              <line x1={PAD_X} y1={gy} x2={W - PAD_X} y2={gy} className="caja-chart__grid" />
              <text x={PAD_X} y={gy - 4} className="caja-chart__ylabel">
                {mxnCorto(max * f)}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill={`url(#caja-area-${id})`} />
        <path d={linePath} className="caja-chart__line" fill="none" />

        {/* columnas invisibles con tooltip nativo por día */}
        {serie.map((p, i) => (
          <rect key={p.fecha} x={x(i) - colW / 2} y={PAD_T} width={colW} height={innerH} fill="transparent">
            <title>{`${fechaDia(p.fecha)} · ${mxnCorto(p.total)}`}</title>
          </rect>
        ))}

        {/* solo el dato de hoy se enfatiza (con halo) */}
        {serie[n - 1].total > 0 && (
          <g>
            <circle cx={x(n - 1)} cy={y(serie[n - 1].total)} r="7" className="caja-chart__halo" />
            <circle cx={x(n - 1)} cy={y(serie[n - 1].total)} r="3.4" className="caja-chart__dot" />
          </g>
        )}

        {/* etiquetas X */}
        {xticks.map((i) => (
          <text key={i} x={x(i)} y={H - 8} className="caja-chart__xlabel" textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}>
            {fechaDia(serie[i].fecha)}
          </text>
        ))}
      </svg>
    </div>
  );
}
