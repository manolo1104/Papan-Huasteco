"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Rol } from "@/lib/caja/auth";
import { EVENTO_ESTADOS, labelDe, type Evento } from "@/lib/caja/types";
import { mxn, fechaCorta, fechaLarga } from "@/lib/caja/format";
import { useFeedback } from "@/components/caja/ui/Feedback";
import { Icon } from "@/components/caja/ui/Icon";

const colorEstado = (id: string) =>
  EVENTO_ESTADOS.find((e) => e.id === id)?.color ?? "#6b7280";

const pad2 = (n: number) => String(n).padStart(2, "0");

type Vista = "lista" | "calendario";

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
  const [vista, setVista] = useState<Vista>("lista");
  const [fechaNuevo, setFechaNuevo] = useState<string>("");

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

  function nuevoEnFecha(iso: string) {
    setFechaNuevo(iso);
    setAbrir(true);
  }

  return (
    <div className="caja-page">
      <header className="caja-head caja-head--row">
        <div>
          <h1>Eventos y grupos</h1>
          <p className="caja-head__sub">
            Saldo total por cobrar: <strong>{mxn(totalPendiente)}</strong>
          </p>
        </div>
        <div className="caja-head__cta">
          <div className="caja-subtabs" role="tablist" aria-label="Cambiar vista">
            <button
              className={`caja-subtab ${vista === "lista" ? "is-active" : ""}`}
              onClick={() => setVista("lista")}
            >
              <Icon name="lista" size={14} /> Lista
            </button>
            <button
              className={`caja-subtab ${vista === "calendario" ? "is-active" : ""}`}
              onClick={() => setVista("calendario")}
            >
              <Icon name="resumen" size={14} /> Calendario
            </button>
          </div>
          <button
            className="caja-btn caja-btn--primary"
            onClick={() => {
              setFechaNuevo("");
              setAbrir((v) => !v);
            }}
          >
            {abrir ? "Cerrar" : "+ Nuevo evento"}
          </button>
        </div>
      </header>

      {abrir && (
        <NuevoEvento
          fechaInicial={fechaNuevo}
          onDone={() => setAbrir(false)}
        />
      )}

      {eventos.length === 0 ? (
        <section className="caja-card">
          <p className="caja-muted">Aún no hay eventos registrados.</p>
        </section>
      ) : vista === "lista" ? (
        <div className="caja-eventos">
          {eventos.map((e) => (
            <EventoCard
              key={e.id}
              e={e}
              rol={rol}
              onAbonar={abonar}
              onEstado={(estado) => patch(e.id, { estado })}
              onBorrar={borrar}
            />
          ))}
        </div>
      ) : (
        <CalendarioEventos
          eventos={eventos}
          rol={rol}
          onAbonar={abonar}
          onEstado={(id, estado) => patch(id, { estado })}
          onBorrar={borrar}
          onNuevoEnFecha={nuevoEnFecha}
        />
      )}
    </div>
  );
}

// ── Tarjeta de un evento (reusada por lista y calendario) ─────
function EventoCard({
  e,
  rol,
  onAbonar,
  onEstado,
  onBorrar,
}: {
  e: Evento;
  rol: Rol;
  onAbonar: (e: Evento) => void;
  onEstado: (estado: string) => void;
  onBorrar: (id: string) => void;
}) {
  const saldo = e.total_acordado - e.pagado;
  return (
    <article className="caja-evento">
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
        <button className="caja-btn caja-btn--sm caja-btn--primary" onClick={() => onAbonar(e)}>
          Registrar abono
        </button>
        <select
          className="caja-select-sm"
          value={e.estado}
          onChange={(ev) => onEstado(ev.target.value)}
        >
          {EVENTO_ESTADOS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        {rol === "admin" && (
          <button className="caja-iconbtn" title="Borrar" onClick={() => onBorrar(e.id)}>
            <Icon name="cerrar" size={15} />
          </button>
        )}
      </div>
    </article>
  );
}

// ── Calendario mensual de eventos ─────────────────────────────
const DOW = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function CalendarioEventos({
  eventos,
  rol,
  onAbonar,
  onEstado,
  onBorrar,
  onNuevoEnFecha,
}: {
  eventos: Evento[];
  rol: Rol;
  onAbonar: (e: Evento) => void;
  onEstado: (id: string, estado: string) => void;
  onBorrar: (id: string) => void;
  onNuevoEnFecha: (iso: string) => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [hoy, setHoy] = useState("");

  // El "hoy" se fija tras montar para no chocar con el render del servidor.
  useEffect(() => {
    const d = new Date();
    setHoy(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`);
  }, []);

  // Eventos agrupados por día (solo los que tienen fecha).
  const porDia = useMemo(() => {
    const map = new Map<string, Evento[]>();
    for (const e of eventos) {
      if (!e.fecha) continue;
      if (!map.has(e.fecha)) map.set(e.fecha, []);
      map.get(e.fecha)!.push(e);
    }
    return map;
  }, [eventos]);

  const sinFecha = useMemo(() => eventos.filter((e) => !e.fecha), [eventos]);

  const { y, m } = cursor;
  const primerDow = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const diasMes = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const celdas: (number | null)[] = [
    ...Array.from({ length: primerDow }, () => null),
    ...Array.from({ length: diasMes }, (_, i) => i + 1),
  ];

  const tituloMes = new Date(Date.UTC(y, m, 1)).toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  function mover(delta: number) {
    setSelected(null);
    setCursor(({ y, m }) => {
      const d = new Date(Date.UTC(y, m + delta, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    });
  }

  function irHoy() {
    const d = new Date();
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
    setSelected(null);
  }

  // Eventos a listar bajo el calendario.
  const delMes = useMemo(
    () =>
      eventos
        .filter((e) => e.fecha && e.fecha.slice(0, 7) === `${y}-${pad2(m + 1)}`)
        .sort((a, b) => (a.fecha! < b.fecha! ? -1 : 1)),
    [eventos, y, m]
  );
  const listados = selected ? porDia.get(selected) ?? [] : delMes;

  return (
    <div className="caja-calwrap">
      <section className="caja-card caja-cal">
        <div className="caja-cal__head">
          <button className="caja-cal__nav" aria-label="Mes anterior" onClick={() => mover(-1)}>
            <Icon name="izquierda" size={18} />
          </button>
          <h2 className="caja-cal__title">
            {tituloMes.charAt(0).toUpperCase() + tituloMes.slice(1)}
          </h2>
          <button className="caja-cal__nav" aria-label="Mes siguiente" onClick={() => mover(1)}>
            <Icon name="derecha" size={18} />
          </button>
          <button className="caja-btn caja-btn--ghost caja-btn--sm caja-cal__hoy" onClick={irHoy}>
            Hoy
          </button>
        </div>

        <div className="caja-cal__dows">
          {DOW.map((d) => (
            <span key={d} className="caja-cal__dow">{d}</span>
          ))}
        </div>

        <div className="caja-cal__grid">
          {celdas.map((dia, i) => {
            if (dia === null) return <div key={`b${i}`} className="caja-cal__cell is-empty" />;
            const iso = `${y}-${pad2(m + 1)}-${pad2(dia)}`;
            const evs = porDia.get(iso) ?? [];
            const cls = [
              "caja-cal__cell",
              iso === hoy ? "is-today" : "",
              iso === selected ? "is-selected" : "",
              evs.length ? "has-ev" : "",
            ].join(" ");
            return (
              <button
                key={iso}
                className={cls}
                onClick={() => setSelected((s) => (s === iso ? null : iso))}
              >
                <span className="caja-cal__num">{dia}</span>
                <span className="caja-cal__evs">
                  {evs.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className="caja-cal__ev"
                      style={{ background: colorEstado(e.estado) }}
                      title={`${e.cliente_nombre} · ${labelDe([...EVENTO_ESTADOS], e.estado)}`}
                    >
                      {e.cliente_nombre}
                    </span>
                  ))}
                  {evs.length > 3 && <span className="caja-cal__more">+{evs.length - 3} más</span>}
                </span>
              </button>
            );
          })}
        </div>

        <ul className="caja-cal__leyenda">
          {EVENTO_ESTADOS.map((s) => (
            <li key={s.id}>
              <span className="caja-cal__punto" style={{ background: s.color }} /> {s.label}
            </li>
          ))}
        </ul>
      </section>

      <section className="caja-calside">
        <div className="caja-calside__head">
          <h3>
            {selected
              ? fechaLarga(selected)
              : `Eventos de ${tituloMes.charAt(0).toUpperCase() + tituloMes.slice(1)}`}
          </h3>
          {selected && (
            <button className="caja-link" onClick={() => setSelected(null)}>Ver todo el mes</button>
          )}
        </div>

        {listados.length === 0 ? (
          <div className="caja-card">
            <p className="caja-muted">
              {selected ? "No hay eventos este día." : "Sin eventos en este mes."}
            </p>
            {selected && (
              <button
                className="caja-btn caja-btn--ghost caja-btn--sm"
                style={{ marginTop: "0.7rem" }}
                onClick={() => onNuevoEnFecha(selected)}
              >
                <Icon name="nuevo" size={15} /> Agregar evento este día
              </button>
            )}
          </div>
        ) : (
          <div className="caja-eventos">
            {listados.map((e) => (
              <EventoCard
                key={e.id}
                e={e}
                rol={rol}
                onAbonar={onAbonar}
                onEstado={(estado) => onEstado(e.id, estado)}
                onBorrar={onBorrar}
              />
            ))}
          </div>
        )}

        {sinFecha.length > 0 && (
          <div className="caja-calside__sinfecha">
            <h3>Sin fecha asignada ({sinFecha.length})</h3>
            <div className="caja-eventos">
              {sinFecha.map((e) => (
                <EventoCard
                  key={e.id}
                  e={e}
                  rol={rol}
                  onAbonar={onAbonar}
                  onEstado={(estado) => onEstado(e.id, estado)}
                  onBorrar={onBorrar}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function NuevoEvento({
  fechaInicial,
  onDone,
}: {
  fechaInicial: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState(fechaInicial);
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
