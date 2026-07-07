"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Rol } from "@/lib/caja/auth";
import { TURNOS, FORMAS_PAGO, labelDe, type Turno, type Gasto } from "@/lib/caja/types";
import { mxn, mxnCorto, fechaCorta } from "@/lib/caja/format";
import { todayISO } from "@/lib/caja/server";
import { useFeedback } from "@/components/caja/ui/Feedback";
import { Icon } from "@/components/caja/ui/Icon";

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
  gastosTurno,
  gastosSinLigar,
}: {
  rol: Rol;
  turnos: Turno[];
  turnoAbierto: Turno | null;
  gastosTurno: Gasto[];
  gastosSinLigar: Gasto[];
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
        <CerrarForm
          turno={turnoAbierto}
          gastosTurno={gastosTurno}
          gastosSinLigar={gastosSinLigar}
        />
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
// Flujo: fondo inicial → ventas por método (efectivo/tarjeta/transferencia/
// booking, pre-cargadas del POS) → ventas totales → gastos del turno (lista)
// → efectivo entregado → corte.
function CerrarForm({
  turno,
  gastosTurno,
  gastosSinLigar,
}: {
  turno: Turno;
  gastosTurno: Gasto[];
  gastosSinLigar: Gasto[];
}) {
  const router = useRouter();
  const { toast } = useFeedback();
  // Si el POS ya registró ventas en este turno, vienen pre-cargadas (editables).
  const desdePos =
    turno.ventas_efectivo > 0 ||
    turno.ventas_tarjeta > 0 ||
    (turno.ventas_transferencia ?? 0) > 0 ||
    (turno.ventas_booking ?? 0) > 0;
  const [vef, setVef] = useState(turno.ventas_efectivo ? String(turno.ventas_efectivo) : "");
  const [vtar, setVtar] = useState(turno.ventas_tarjeta ? String(turno.ventas_tarjeta) : "");
  const [vtransf, setVtransf] = useState(turno.ventas_transferencia ? String(turno.ventas_transferencia) : "");
  const [vbook, setVbook] = useState(turno.ventas_booking ? String(turno.ventas_booking) : "");
  const [otros, setOtros] = useState("");
  const [otrosNota, setOtrosNota] = useState("");
  const [retiros, setRetiros] = useState("");
  const [contado, setContado] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ligando, setLigando] = useState(false);

  const gastosEfectivo = useMemo(
    () => gastosTurno.filter((g) => g.forma_pago === "efectivo").reduce((a, g) => a + g.monto, 0),
    [gastosTurno]
  );
  const gastosTotal = useMemo(() => gastosTurno.reduce((a, g) => a + g.monto, 0), [gastosTurno]);

  const esperado = useMemo(
    () => turno.fondo_inicial + n(vef) + n(otros) - gastosEfectivo - n(retiros),
    [turno.fondo_inicial, vef, otros, gastosEfectivo, retiros]
  );
  const diferencia = useMemo(() => n(contado) - esperado, [contado, esperado]);
  const totalIngresos = n(vef) + n(vtar) + n(vtransf) + n(vbook) + n(otros);
  const noCaja = n(vtar) + n(vtransf) + n(vbook);

  async function ligarGasto(id: string) {
    setLigando(true);
    const res = await fetch("/api/admin/gastos", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action: "ligar_turno" }),
    });
    setLigando(false);
    if (res.ok) {
      toast.success("Gasto ligado al turno");
      router.refresh();
    } else toast.error("No se pudo ligar el gasto.");
  }

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
        ventas_transferencia: n(vtransf),
        ventas_booking: n(vbook),
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
        {/* 1 · Fondo inicial */}
        <p className="caja-muted caja-form__full">
          <strong>Fondo inicial: {mxn(turno.fondo_inicial)}</strong>
          {turno.responsable ? ` · Responsable: ${turno.responsable}` : ""}
        </p>

        {/* 2 · Ventas por método */}
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
          <span>Ventas por transferencia</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={vtransf} onChange={(e) => setVtransf(e.target.value)} placeholder="$" />
        </label>
        <label className="caja-field">
          <span>Ventas booking (paga el hotel)</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={vbook} onChange={(e) => setVbook(e.target.value)} placeholder="$" />
        </label>
        <label className="caja-field">
          <span>Otros ingresos (efectivo)</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={otros} onChange={(e) => setOtros(e.target.value)} placeholder="$ (opcional)" />
        </label>
        <label className="caja-field">
          <span>Nota de otros ingresos</span>
          <input value={otrosNota} onChange={(e) => setOtrosNota(e.target.value)} placeholder="¿De qué fue? (opcional)" />
        </label>

        {/* 3 · Ventas totales */}
        <div className="caja-corte caja-form__full" style={{ paddingBottom: "0.4rem" }}>
          <div className="caja-corte__row caja-corte__row--big">
            <span>Ventas totales del turno</span>
            <strong>{mxn(totalIngresos)}</strong>
          </div>
        </div>

        {/* 4 · Gastos del turno */}
        <div className="caja-form__full caja-gastos-turno">
          <span className="caja-gastos-turno__lbl">Gastos del turno</span>
          {gastosTurno.length === 0 ? (
            <p className="caja-muted">Sin gastos ligados a este turno.</p>
          ) : (
            <ul className="caja-gastos-turno__lista">
              {gastosTurno.map((g) => (
                <li key={g.id}>
                  <span>
                    {g.concepto}
                    <em> · {labelDe([...FORMAS_PAGO], g.forma_pago)}</em>
                  </span>
                  <strong>{mxnCorto(g.monto)}</strong>
                </li>
              ))}
              <li className="caja-gastos-turno__total">
                <span>Total gastos ({mxnCorto(gastosEfectivo)} en efectivo)</span>
                <strong>{mxnCorto(gastosTotal)}</strong>
              </li>
            </ul>
          )}
          {gastosSinLigar.length > 0 && (
            <div className="caja-gastos-turno__aviso">
              ⚠ Hay {gastosSinLigar.length} gasto{gastosSinLigar.length === 1 ? "" : "s"} de hoy SIN
              ligar al turno (no entran al corte):
              <ul>
                {gastosSinLigar.map((g) => (
                  <li key={g.id}>
                    <span>
                      {g.concepto} · {mxnCorto(g.monto)}
                    </span>
                    <button
                      type="button"
                      className="caja-btn caja-btn--ghost caja-btn--sm"
                      disabled={ligando}
                      onClick={() => ligarGasto(g.id)}
                    >
                      Ligar al turno
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 5 · Retiros y efectivo entregado */}
        <label className="caja-field">
          <span>Retiros / depósitos</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={retiros} onChange={(e) => setRetiros(e.target.value)} placeholder="$ que sacaste de caja" />
        </label>
        <label className="caja-field">
          <span>Efectivo entregado (contado al cierre)</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={contado} onChange={(e) => setContado(e.target.value)} placeholder="$ que entregas físicamente" />
        </label>

        {/* 6 · Corte */}
        <div className="caja-corte caja-form__full">
          <div className="caja-corte__row">
            <span>Fondo inicial</span>
            <strong>{mxn(turno.fondo_inicial)}</strong>
          </div>
          <div className="caja-corte__row">
            <span>+ Ventas en efectivo y otros ingresos</span>
            <strong>{mxn(n(vef) + n(otros))}</strong>
          </div>
          <div className="caja-corte__row">
            <span>− Gastos en efectivo del turno</span>
            <strong>{mxn(gastosEfectivo)}</strong>
          </div>
          <div className="caja-corte__row">
            <span>− Retiros</span>
            <strong>{mxn(n(retiros))}</strong>
          </div>
          <div className="caja-corte__row caja-corte__row--big">
            <span>Efectivo esperado en caja</span>
            <strong>{mxn(esperado)}</strong>
          </div>
          <div className="caja-corte__row">
            <span>Ingresos que NO entran a caja (tarjeta + transferencia + booking)</span>
            <strong>{mxn(noCaja)}</strong>
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
                <th className="num">Transf.</th>
                <th className="num">Booking</th>
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
                  <td className="num">{t.estado === "cerrado" ? mxnCorto(t.ventas_transferencia ?? 0) : "—"}</td>
                  <td className="num">{t.estado === "cerrado" ? mxnCorto(t.ventas_booking ?? 0) : "—"}</td>
                  <td className="num">{t.estado === "cerrado" ? mxnCorto(t.total_ingresos) : "—"}</td>
                  <td className={`num ${t.diferencia < 0 ? "neg" : t.diferencia > 0 ? "pos" : ""}`}>
                    {t.estado === "cerrado" ? mxnCorto(t.diferencia) : "—"}
                  </td>
                  {rol === "admin" && (
                    <td className="num">
                      <button className="caja-iconbtn" title="Borrar" onClick={() => borrar(t.id)}><Icon name="cerrar" size={15} /></button>
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
