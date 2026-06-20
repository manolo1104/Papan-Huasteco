"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Rol } from "@/lib/caja/auth";
import { EVENTO_ESTADOS, labelDe, type Evento } from "@/lib/caja/types";
import { mxn, fechaCorta } from "@/lib/caja/format";
import { useFeedback } from "@/components/caja/ui/Feedback";
import { Icon } from "@/components/caja/ui/Icon";

const colorEstado = (id: string) =>
  EVENTO_ESTADOS.find((e) => e.id === id)?.color ?? "#6b7280";

export default function EventosPanel({
  rol,
  eventos,
}: {
  rol: Rol;
  eventos: Evento[];
}) {
  const router = useRouter();
  const { toast, confirm, prompt } = useFeedback();
  const [abrir, setAbrir] = useState(false);

  const totalPendiente = eventos
    .filter((e) => e.estado !== "cancelado")
    .reduce((a, e) => a + Math.max(0, e.total_acordado - e.pagado), 0);

  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch("/api/admin/eventos", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    if (res.ok) router.refresh();
    else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || "No se pudo actualizar.");
    }
  }

  async function abonar(e: Evento) {
    const txt = await prompt({
      title: `Abono de ${e.cliente_nombre}`,
      message: `Saldo actual: ${mxn(e.total_acordado - e.pagado)}`,
      label: "¿Cuánto abona ahora?",
      type: "number",
      placeholder: "$",
      confirmLabel: "Registrar abono",
    });
    if (txt == null) return;
    const monto = Number(txt);
    if (!Number.isFinite(monto) || monto <= 0) return toast.error("Monto no válido.");
    await patch(e.id, { pagado: e.pagado + monto });
    toast.success("Abono registrado");
  }

  async function borrar(id: string) {
    const ok = await confirm({
      title: "¿Borrar este evento?",
      confirmLabel: "Borrar",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/eventos?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Evento borrado");
      router.refresh();
    } else toast.error("No se pudo borrar.");
  }

  return (
    <div className="caja-page">
      <header className="caja-head caja-head--row">
        <div>
          <h1>Eventos y grupos</h1>
          <p className="caja-head__sub">
            Saldo total por cobrar:{" "}
            <strong>{mxn(totalPendiente)}</strong>
          </p>
        </div>
        <button className="caja-btn caja-btn--primary" onClick={() => setAbrir((v) => !v)}>
          {abrir ? "Cerrar" : "+ Nuevo evento"}
        </button>
      </header>

      {abrir && <NuevoEvento onDone={() => setAbrir(false)} />}

      {eventos.length === 0 ? (
        <section className="caja-card">
          <p className="caja-muted">Aún no hay eventos registrados.</p>
        </section>
      ) : (
        <div className="caja-eventos">
          {eventos.map((e) => {
            const saldo = e.total_acordado - e.pagado;
            return (
              <article key={e.id} className="caja-evento">
                <div className="caja-evento__top">
                  <h3>{e.cliente_nombre}</h3>
                  <span className="caja-chip" style={{ background: colorEstado(e.estado) }}>
                    {labelDe([...EVENTO_ESTADOS], e.estado)}
                  </span>
                </div>
                <div className="caja-evento__meta">
                  {fechaCorta(e.fecha)}
                  {e.num_personas ? ` · ${e.num_personas} personas` : ""}
                  {e.contacto ? ` · ${e.contacto}` : ""}
                </div>
                {e.notas && <p className="caja-evento__notas">{e.notas}</p>}
                <div className="caja-evento__nums">
                  <span>Total <strong>{mxn(e.total_acordado)}</strong></span>
                  <span>Pagado <strong>{mxn(e.pagado)}</strong></span>
                  <span className={saldo > 0.5 ? "saldo" : "ok"}>
                    Saldo <strong>{mxn(saldo)}</strong>
                  </span>
                </div>
                <div className="caja-evento__acciones">
                  <button className="caja-btn caja-btn--sm caja-btn--primary" onClick={() => abonar(e)}>
                    Registrar abono
                  </button>
                  <select
                    className="caja-select-sm"
                    value={e.estado}
                    onChange={(ev) => patch(e.id, { estado: ev.target.value })}
                  >
                    {EVENTO_ESTADOS.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                  {rol === "admin" && (
                    <button className="caja-iconbtn" title="Borrar" onClick={() => borrar(e.id)}><Icon name="cerrar" size={15} /></button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NuevoEvento({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState("");
  const [personas, setPersonas] = useState("");
  const [total, setTotal] = useState("");
  const [anticipo, setAnticipo] = useState("");
  const [contacto, setContacto] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/eventos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        cliente_nombre: cliente,
        fecha: fecha || null,
        num_personas: personas === "" ? null : Number(personas),
        total_acordado: total === "" ? 0 : Number(total),
        pagado: anticipo === "" ? 0 : Number(anticipo),
        contacto,
        notas,
        estado: "cotizado",
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(data.error || "No se pudo crear el evento.");
    router.refresh();
    onDone();
  }

  return (
    <section className="caja-card caja-card--accent">
      <h3 className="caja-card__title">Nuevo evento</h3>
      <form className="caja-form caja-form--grid" onSubmit={submit}>
        <label className="caja-field">
          <span>Cliente / nombre del evento</span>
          <input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Ej. Cumpleaños Familia López" />
        </label>
        <label className="caja-field">
          <span>Fecha del evento</span>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </label>
        <label className="caja-field">
          <span>Personas</span>
          <input type="number" min="0" inputMode="numeric" value={personas} onChange={(e) => setPersonas(e.target.value)} placeholder="# de personas" />
        </label>
        <label className="caja-field">
          <span>Contacto</span>
          <input value={contacto} onChange={(e) => setContacto(e.target.value)} placeholder="WhatsApp / teléfono" />
        </label>
        <label className="caja-field">
          <span>Total acordado</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="$" />
        </label>
        <label className="caja-field">
          <span>Anticipo recibido</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={anticipo} onChange={(e) => setAnticipo(e.target.value)} placeholder="$ (opcional)" />
        </label>
        <label className="caja-field caja-form__full">
          <span>Notas</span>
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} placeholder="Menú acordado, detalles… (opcional)" />
        </label>
        {error && <p className="caja-error caja-form__full">{error}</p>}
        <div className="caja-form__full">
          <button className="caja-btn caja-btn--primary" disabled={loading}>
            {loading ? "Guardando…" : "Crear evento"}
          </button>
        </div>
      </form>
    </section>
  );
}
