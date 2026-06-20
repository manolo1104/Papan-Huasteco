"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Rol } from "@/lib/caja/auth";
import { TURNOS, labelDe, type Turno } from "@/lib/caja/types";
import { mxn, mxnCorto, fechaCorta } from "@/lib/caja/format";
import { todayISO } from "@/lib/caja/server";
import { useFeedback } from "@/components/caja/ui/Feedback";

const n = (v: string) => (v === "" ? 0 : Number(v) || 0);

/** Turno sugerido según la hora de México: matutino antes de las 14h. */
function turnoSugerido(): string {
  const h = Number(
    new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City", hour: "2-digit", hour12: false })
  );
  return h < 14 ? "matutino" : "vespertino";
}

export default function TurnosPanel({
  rol,
  turnos,
  turnoAbierto,
  gastosEfectivoAbierto,
}: {
  rol: Rol;
  turnos: Turno[];
  turnoAbierto: Turno | null;
  gastosEfectivoAbierto: number;
}) {
  return (
    <div className="caja-page">
      <header className="caja-head">
        <h1>Turnos y cortes de caja</h1>
        <p className="caja-head__sub">
          Abre el turno con el fondo de caja y ciérralo capturando las ventas y el
          conteo del efectivo.
        </p>
      </header>

      {turnoAbierto ? (
        <CerrarForm turno={turnoAbierto} gastosEfectivo={gastosEfectivoAbierto} />
      ) : (
        <AbrirForm rol={rol} />
      )}

      <Historial rol={rol} turnos={turnos} />
    </div>
  );
}

// ── Abrir turno ───────────────────────────────────────────────
function AbrirForm({ rol }: { rol: Rol }) {
  const router = useRouter();
  const { toast } = useFeedback();
  const [fecha, setFecha] = useState(todayISO());
  const [turno, setTurno] = useState(turnoSugerido());
  const [responsable, setResponsable] = useState(rol === "admin" ? "Dueño" : "");
  const [fondo, setFondo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/turnos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fecha, turno, responsable, fondo_inicial: n(fondo) }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(data.error || "No se pudo abrir el turno.");
    toast.success("Turno abierto");
    router.refresh();
  }

  return (
    <section className="caja-card">
      <h3 className="caja-card__title">Abrir turno</h3>
      <form className="caja-form caja-form--grid" onSubmit={submit}>
        <label className="caja-field">
          <span>Fecha</span>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </label>
        <label className="caja-field">
          <span>Turno</span>
          <select value={turno} onChange={(e) => setTurno(e.target.value)}>
            {TURNOS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </label>
        <label className="caja-field">
          <span>Responsable</span>
          <input value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="Quién atiende la caja" />
        </label>
        <label className="caja-field">
          <span>Fondo de caja inicial</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={fondo} onChange={(e) => setFondo(e.target.value)} placeholder="$ con que abres" />
        </label>
        {error && <p className="caja-error caja-form__full">{error}</p>}
        <div className="caja-form__full">
          <button className="caja-btn caja-btn--primary" disabled={loading}>
            {loading ? "Abriendo…" : "Abrir turno"}
          </button>
        </div>
      </form>
    </section>
  );
}

// ── Cerrar turno ──────────────────────────────────────────────
function CerrarForm({ turno, gastosEfectivo }: { turno: Turno; gastosEfectivo: number }) {
  const router = useRouter();
  // Si el POS ya registró ventas en este turno, vienen pre-cargadas (editables).
  const desdePos = turno.ventas_efectivo > 0 || turno.ventas_tarjeta > 0;
  const [vef, setVef] = useState(turno.ventas_efectivo ? String(turno.ventas_efectivo) : "");
  const [vtar, setVtar] = useState(turno.ventas_tarjeta ? String(turno.ventas_tarjeta) : "");
  const [otros, setOtros] = useState("");
  const [otrosNota, setOtrosNota] = useState("");
  const [retiros, setRetiros] = useState("");
  const [contado, setContado] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const esperado = useMemo(
    () => turno.fondo_inicial + n(vef) + n(otros) - gastosEfectivo - n(retiros),
    [turno.fondo_inicial, vef, otros, gastosEfectivo, retiros]
  );
  const diferencia = useMemo(() => n(contado) - esperado, [contado, esperado]);
  const totalIngresos = n(vef) + n(vtar) + n(otros);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/turnos", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: turno.id,
        action: "cerrar",
        ventas_efectivo: n(vef),
        ventas_tarjeta: n(vtar),
        otros_ingresos: n(otros),
        otros_ingresos_nota: otrosNota,
        retiros: n(retiros),
        efectivo_contado: n(contado),
        notas,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(data.error || "No se pudo cerrar el turno.");
    router.refresh();
  }

  return (
    <section className="caja-card caja-card--accent">
      <div className="caja-card__head">
        <h3 className="caja-card__title">
          Cerrar turno · {labelDe([...TURNOS], turno.turno)} del {fechaCorta(turno.fecha)}
        </h3>
        <span className="caja-tag caja-tag--abierto">abierto</span>
      </div>
      <form className="caja-form caja-form--grid" onSubmit={submit}>
        {desdePos && (
          <p className="caja-muted caja-form__full">
            💡 Las ventas vienen del POS (cobros del turno). Puedes ajustarlas si cobraste algo aparte.
          </p>
        )}
        <label className="caja-field">
          <span>Ventas en efectivo</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={vef} onChange={(e) => setVef(e.target.value)} placeholder="$" />
        </label>
        <label className="caja-field">
          <span>Ventas con tarjeta</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={vtar} onChange={(e) => setVtar(e.target.value)} placeholder="$" />
        </label>
        <label className="caja-field">
          <span>Otros ingresos (efectivo)</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={otros} onChange={(e) => setOtros(e.target.value)} placeholder="$ (opcional)" />
        </label>
        <label className="caja-field">
          <span>Nota de otros ingresos</span>
          <input value={otrosNota} onChange={(e) => setOtrosNota(e.target.value)} placeholder="¿De qué fue? (opcional)" />
        </label>
        <label className="caja-field">
          <span>Retiros / depósitos</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={retiros} onChange={(e) => setRetiros(e.target.value)} placeholder="$ que sacaste de caja" />
        </label>
        <label className="caja-field">
          <span>Efectivo contado al cierre</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={contado} onChange={(e) => setContado(e.target.value)} placeholder="$ que hay físicamente" />
        </label>

        <div className="caja-corte caja-form__full">
          <div className="caja-corte__row">
            <span>Fondo inicial</span>
            <strong>{mxn(turno.fondo_inicial)}</strong>
          </div>
          <div className="caja-corte__row">
            <span>− Gastos en efectivo del turno</span>
            <strong>{mxn(gastosEfectivo)}</strong>
          </div>
          <div className="caja-corte__row">
            <span>Ventas totales</span>
            <strong>{mxn(totalIngresos)}</strong>
          </div>
          <div className="caja-corte__row caja-corte__row--big">
            <span>Efectivo esperado en caja</span>
            <strong>{mxn(esperado)}</strong>
          </div>
          <div
            className={`caja-corte__dif ${diferencia < 0 ? "neg" : diferencia > 0 ? "pos" : ""}`}
          >
            {diferencia < 0
              ? `Faltante de ${mxn(Math.abs(diferencia))}`
              : diferencia > 0
              ? `Sobrante de ${mxn(diferencia)}`
              : "La caja cuadra exacto ✓"}
          </div>
        </div>

        <label className="caja-field caja-form__full">
          <span>Notas del turno</span>
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} placeholder="Lo que quieras anotar (opcional)" />
        </label>

        {error && <p className="caja-error caja-form__full">{error}</p>}
        <div className="caja-form__full">
          <button className="caja-btn caja-btn--primary" disabled={loading}>
            {loading ? "Cerrando…" : "Cerrar turno y guardar corte"}
          </button>
        </div>
      </form>
    </section>
  );
}

// ── Historial ─────────────────────────────────────────────────
function Historial({ rol, turnos }: { rol: Rol; turnos: Turno[] }) {
  const router = useRouter();
  const { toast, confirm } = useFeedback();
  async function borrar(id: string) {
    const ok = await confirm({
      title: "¿Borrar este turno?",
      message: "No se puede deshacer.",
      confirmLabel: "Borrar",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/turnos?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Turno borrado");
      router.refresh();
    } else toast.error("No se pudo borrar.");
  }

  return (
    <section className="caja-card">
      <h3 className="caja-card__title">Historial de turnos</h3>
      {turnos.length === 0 ? (
        <p className="caja-muted">Aún no hay turnos registrados.</p>
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
                {rol === "admin" && <th></th>}
              </tr>
            </thead>
            <tbody>
              {turnos.map((t) => (
                <tr key={t.id}>
                  <td>{fechaCorta(t.fecha)}</td>
                  <td>
                    {labelDe([...TURNOS], t.turno)}
                    {t.estado === "abierto" && <span className="caja-tag caja-tag--abierto">abierto</span>}
                  </td>
                  <td className="num">{t.estado === "cerrado" ? mxnCorto(t.ventas_efectivo) : "—"}</td>
                  <td className="num">{t.estado === "cerrado" ? mxnCorto(t.ventas_tarjeta) : "—"}</td>
                  <td className="num">{t.estado === "cerrado" ? mxnCorto(t.total_ingresos) : "—"}</td>
                  <td className={`num ${t.diferencia < 0 ? "neg" : t.diferencia > 0 ? "pos" : ""}`}>
                    {t.estado === "cerrado" ? mxnCorto(t.diferencia) : "—"}
                  </td>
                  {rol === "admin" && (
                    <td className="num">
                      <button className="caja-iconbtn" title="Borrar" onClick={() => borrar(t.id)}>✕</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
