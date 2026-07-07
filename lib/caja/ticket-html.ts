import { SITE } from "@/lib/site";
import type { Orden, OrdenItem } from "./types";

// La cuenta de una mesa como HTML imprimible / descargable en PDF.
// Se abre en una ventana nueva y window.print() deja "Guardar como PDF"
// (mismo patrón que Reportes y Resumen). Corre en el navegador.

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const money = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

const FORMA_LABEL: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  booking: "Booking (por cuenta del hotel)",
};

export function ticketHtml(params: {
  mesa: string;
  personas: number | null;
  mesero?: string | null;
  items: OrdenItem[];
  total: number;
  orden?: Orden | null;
}): string {
  const { mesa, personas, mesero, items, total, orden } = params;
  const ahora = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const filas = items
    .map(
      (it) => `
      <tr>
        <td class="qty">${it.cantidad}×</td>
        <td class="nom">${esc(it.nombre)}${it.nota ? `<div class="nota">${esc(it.nota)}</div>` : ""}</td>
        <td class="imp">${money(it.precio_unit * it.cantidad)}</td>
      </tr>`
    )
    .join("");

  const cobrada = orden && orden.estado === "cobrada";
  const cambio =
    cobrada && orden?.forma_pago === "efectivo" && orden.pago_recibido
      ? orden.pago_recibido - total
      : null;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Cuenta ${esc(mesa)} · ${esc(SITE.name)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Georgia, "Times New Roman", serif;
    color: #1a1a14;
    background: #fff;
    width: 420px;
    margin: 0 auto;
    padding: 28px 24px;
  }
  header { text-align: center; border-bottom: 2px solid #1a1a14; padding-bottom: 14px; }
  h1 { font-size: 21px; letter-spacing: 0.02em; }
  .sub { font-size: 11.5px; color: #555; margin-top: 4px; line-height: 1.5; }
  .meta { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px;
          font-size: 12.5px; padding: 12px 0; border-bottom: 1px dashed #999; }
  .meta strong { font-size: 15px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  td { padding: 7px 4px; border-bottom: 1px dotted #ccc; vertical-align: top; font-size: 13.5px; }
  .qty { width: 34px; color: #555; white-space: nowrap; }
  .nom { }
  .nota { font-size: 11.5px; color: #666; font-style: italic; margin-top: 2px; }
  .imp { text-align: right; white-space: nowrap; }
  .total { display: flex; justify-content: space-between; align-items: baseline;
           margin-top: 14px; padding-top: 12px; border-top: 2px solid #1a1a14; }
  .total span { font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; }
  .total strong { font-size: 24px; }
  .pago { margin-top: 10px; font-size: 12.5px; color: #333; line-height: 1.7; }
  footer { text-align: center; margin-top: 26px; font-size: 12px; color: #555; line-height: 1.7; }
  .gracias { font-size: 14px; color: #1a1a14; font-style: italic; }
  @media print {
    body { width: auto; padding: 8px 4px; }
    @page { margin: 12mm; }
  }
</style>
</head>
<body>
  <header>
    <h1>${esc(SITE.name)}</h1>
    <p class="sub">${esc(SITE.address.full)}<br/>Tel. ${esc(SITE.phoneDisplay)}</p>
  </header>

  <div class="meta">
    <span><strong>${esc(mesa)}</strong></span>
    ${personas ? `<span>${personas} persona${personas === 1 ? "" : "s"}</span>` : ""}
    ${mesero ? `<span>Atendió: ${esc(mesero)}</span>` : ""}
    <span>${esc(ahora)}</span>
  </div>

  <table>${filas}</table>

  <div class="total"><span>Total</span><strong>${money(total)}</strong></div>

  ${
    cobrada
      ? `<div class="pago">
          Pagado con: <strong>${esc(FORMA_LABEL[orden!.forma_pago ?? ""] ?? orden!.forma_pago ?? "")}</strong>
          ${orden!.pago_recibido ? `<br/>Recibido: ${money(orden!.pago_recibido)}` : ""}
          ${cambio !== null && cambio >= 0 ? `<br/>Cambio: ${money(cambio)}` : ""}
          ${orden!.pago_referencia ? `<br/>Referencia: ${esc(orden!.pago_referencia)}` : ""}
        </div>`
      : ""
  }

  <footer>
    <p class="gracias">Gracias por su visita — nuestra casa es su casa</p>
    <p>${esc(SITE.tagline)}</p>
  </footer>
</body>
</html>`;
}

/** Abre la cuenta en una ventana nueva lista para imprimir / guardar en PDF. */
export function abrirTicket(params: Parameters<typeof ticketHtml>[0]): void {
  const w = window.open("", "_blank", "width=520,height=720");
  if (!w) return;
  w.document.write(ticketHtml(params));
  w.document.close();
  w.focus();
  // pequeña espera para que cargue la fuente/estilos antes del diálogo
  setTimeout(() => w.print(), 250);
}
