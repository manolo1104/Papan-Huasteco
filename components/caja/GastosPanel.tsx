"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Rol } from "@/lib/caja/auth";
import {
  FORMAS_PAGO,
  TURNOS,
  labelDe,
  type Gasto,
  type Turno,
  type Categoria,
} from "@/lib/caja/types";
import { mxn, fechaCorta } from "@/lib/caja/format";
import { todayISO } from "@/lib/caja/server";
import { useFeedback } from "@/components/caja/ui/Feedback";
import { Icon } from "@/components/caja/ui/Icon";

const OTRO = "__otro__";

export default function GastosPanel({
  rol,
  gastos,
  turnoAbierto,
  categorias,
  conceptos,
}: {
  rol: Rol;
  gastos: Gasto[];
  turnoAbierto: Turno | null;
  categorias: Categoria[];
  conceptos: Categoria[];
}) {
  const router = useRouter();
  const { toast, confirm } = useFeedback();
  const activas = categorias.filter((c) => c.activo);
  const conceptosActivos = conceptos.filter((c) => c.activo);
  const [fecha, setFecha] = useState(todayISO());
  const [categoria, setCategoria] = useState(activas[0]?.id ?? "otros");
  const [concepto, setConcepto] = useState(conceptosActivos[0]?.label ?? OTRO);
  const [conceptoLibre, setConceptoLibre] = useState("");
  const [monto, setMonto] = useState("");
  const [formaPago, setFormaPago] = useState("efectivo");
  const [proveedor, setProveedor] = useState("");
  const [ligar, setLigar] = useState(Boolean(turnoAbierto));
  const [comprobante, setComprobante] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function subirTicket(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setSubiendo(false);
    if (!res.ok) return setError(data.error || "No se pudo subir la foto.");
    setComprobante(data.url);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const conceptoFinal = (concepto === OTRO ? conceptoLibre : concepto).trim();
    if (!conceptoFinal) return setError("Elige o escribe el concepto del gasto.");
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/gastos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fecha,
        categoria,
        concepto: conceptoFinal,
        monto: monto === "" ? 0 : Number(monto),
        forma_pago: formaPago,
        proveedor,
        comprobante_url: comprobante,
        turno_id: ligar && turnoAbierto ? turnoAbierto.id : null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(data.error || "No se pudo guardar el gasto.");
    setConcepto(conceptosActivos[0]?.label ?? OTRO);
    setConceptoLibre("");
    setMonto("");
    setProveedor("");
    setComprobante(null);
    toast.success("Gasto registrado");
    router.refresh();
  }

  async function borrar(id: string) {
    const ok = await confirm({
      title: "¿Borrar este gasto?",
      confirmLabel: "Borrar",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/gastos?id=${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      toast.success("Gasto borrado");
      router.refresh();
    } else toast.error(data.error || "No se pudo borrar.");
  }

  const total = gastos.reduce((a, g) => a + g.monto, 0);

  return (
    <div className="caja-page">
      <header className="caja-head">
        <h1>Gastos y egresos</h1>
        <p className="caja-head__sub">
          Compras, proveedores, nómina y pagos. Los gastos en efectivo del turno
          se descuentan solos al hacer el corte.
        </p>
      </header>

      <section className="caja-card">
        <h3 className="caja-card__title">Registrar gasto</h3>
        <form className="caja-form caja-form--grid" onSubmit={submit}>
          <label className="caja-field">
            <span>Fecha</span>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </label>
          <label className="caja-field">
            <span>Categoría</span>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {activas.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="caja-field">
            <span>Concepto</span>
            <select value={concepto} onChange={(e) => setConcepto(e.target.value)}>
              {conceptosActivos.map((c) => (
                <option key={c.id} value={c.label}>{c.label}</option>
              ))}
              <option value={OTRO}>Otro (escribir)…</option>
            </select>
          </label>
          {concepto === OTRO && (
            <label className="caja-field">
              <span>Escribe el concepto</span>
              <input
                value={conceptoLibre}
                onChange={(e) => setConceptoLibre(e.target.value)}
                placeholder="¿En qué se gastó?"
                autoFocus
              />
            </label>
          )}
          <label className="caja-field">
            <span>Monto</span>
            <input type="number" min="0" step="0.01" inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="$" />
          </label>
          <label className="caja-field">
            <span>Forma de pago</span>
            <select value={formaPago} onChange={(e) => setFormaPago(e.target.value)}>
              {FORMAS_PAGO.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>
          <label className="caja-field">
            <span>Proveedor (opcional)</span>
            <input value={proveedor} onChange={(e) => setProveedor(e.target.value)} placeholder="A quién se le pagó" />
          </label>

          <div className="caja-field caja-form__full">
            <span>Foto del ticket (opcional)</span>
            {comprobante ? (
              <div className="caja-ticket-prev">
                <a href={comprobante} target="_blank" rel="noopener noreferrer" className="caja-link--icon"><Icon name="ticket" size={15} /> Ver comprobante</a>
                <button type="button" className="caja-iconbtn" onClick={() => setComprobante(null)}>quitar</button>
              </div>
            ) : (
              <input type="file" accept="image/*,application/pdf" capture="environment" onChange={subirTicket} disabled={subiendo} />
            )}
            {subiendo && <span className="caja-muted">Subiendo foto…</span>}
          </div>

          {turnoAbierto && (
            <label className="caja-check caja-form__full">
              <input type="checkbox" checked={ligar} onChange={(e) => setLigar(e.target.checked)} />
              <span>
                Ligar al turno abierto ({labelDe([...TURNOS], turnoAbierto.turno)} del{" "}
                {fechaCorta(turnoAbierto.fecha)}) para que cuente en el corte
              </span>
            </label>
          )}

          {error && <p className="caja-error caja-form__full">{error}</p>}
          <div className="caja-form__full">
            <button className="caja-btn caja-btn--primary" disabled={loading || subiendo}>
              {loading ? "Guardando…" : "Guardar gasto"}
            </button>
          </div>
        </form>
      </section>

      <section className="caja-card">
        <div className="caja-card__head">
          <h3 className="caja-card__title">Gastos recientes</h3>
          <span className="caja-muted">Total mostrado: <strong>{mxn(total)}</strong></span>
        </div>
        {gastos.length === 0 ? (
          <p className="caja-muted">Aún no hay gastos registrados.</p>
        ) : (
          <div className="caja-table-wrap">
            <table className="caja-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Categoría</th>
                  <th>Concepto</th>
                  <th>Pago</th>
                  <th>Ticket</th>
                  <th className="num">Monto</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((g) => (
                  <tr key={g.id}>
                    <td>{fechaCorta(g.fecha)}</td>
                    <td>{labelDe(categorias, g.categoria)}</td>
                    <td>
                      {g.concepto}
                      {g.proveedor && <span className="caja-muted"> · {g.proveedor}</span>}
                    </td>
                    <td>{labelDe([...FORMAS_PAGO], g.forma_pago)}</td>
                    <td>
                      {g.comprobante_url ? (
                        <a href={g.comprobante_url} target="_blank" rel="noopener noreferrer" className="caja-link caja-link--icon"><Icon name="ticket" size={14} /> Ver</a>
                      ) : (
                        <span className="caja-muted">—</span>
                      )}
                    </td>
                    <td className="num">{mxn(g.monto)}</td>
                    <td className="num">
                      <button className="caja-iconbtn" title="Borrar" onClick={() => borrar(g.id)}><Icon name="cerrar" size={15} /></button>
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
