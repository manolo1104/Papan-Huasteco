"use client";

import type { Turno, Gasto } from "@/lib/caja/types";
import { labelDe, TURNOS, GASTO_CATEGORIAS, FORMAS_PAGO } from "@/lib/caja/types";

function descargarCSV(nombre: string, filas: string[][]) {
  const csv = filas
    .map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportesActions({
  desde,
  hasta,
  turnos,
  gastos,
}: {
  desde: string;
  hasta: string;
  turnos: Turno[];
  gastos: Gasto[];
}) {
  function exportTurnos() {
    const filas: string[][] = [
      ["Fecha", "Turno", "Responsable", "Efectivo", "Tarjeta", "Otros", "Ingresos", "Esperado", "Contado", "Diferencia"],
      ...turnos.map((t) => [
        t.fecha,
        labelDe([...TURNOS], t.turno),
        t.responsable ?? "",
        String(t.ventas_efectivo),
        String(t.ventas_tarjeta),
        String(t.otros_ingresos),
        String(t.total_ingresos),
        String(t.efectivo_esperado),
        String(t.efectivo_contado),
        String(t.diferencia),
      ]),
    ];
    descargarCSV(`turnos_${desde}_a_${hasta}.csv`, filas);
  }

  function exportGastos() {
    const filas: string[][] = [
      ["Fecha", "Categoría", "Concepto", "Proveedor", "Forma de pago", "Monto"],
      ...gastos.map((g) => [
        g.fecha,
        labelDe([...GASTO_CATEGORIAS], g.categoria),
        g.concepto,
        g.proveedor ?? "",
        labelDe([...FORMAS_PAGO], g.forma_pago),
        String(g.monto),
      ]),
    ];
    descargarCSV(`gastos_${desde}_a_${hasta}.csv`, filas);
  }

  return (
    <div className="caja-reportes__actions caja-noprint">
      <button className="caja-btn caja-btn--ghost caja-btn--sm" onClick={exportTurnos}>
        ⬇ Turnos (CSV)
      </button>
      <button className="caja-btn caja-btn--ghost caja-btn--sm" onClick={exportGastos}>
        ⬇ Gastos (CSV)
      </button>
      <button className="caja-btn caja-btn--ghost caja-btn--sm" onClick={() => window.print()}>
        🖨 Imprimir / PDF
      </button>
    </div>
  );
}
