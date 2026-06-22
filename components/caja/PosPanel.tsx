"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Rol } from "@/lib/caja/auth";
import type { Mesa, Orden, OrdenItem, Producto } from "@/lib/caja/types";
import { mxn, mxnCorto } from "@/lib/caja/format";
import { useFeedback } from "@/components/caja/ui/Feedback";
import { Icon } from "@/components/caja/ui/Icon";

export default function PosPanel({
  rol,
  mesas,
  ordenesAbiertas,
  productos,
  mesaSel,
  orden,
  items,
}: {
  rol: Rol;
  mesas: Mesa[];
  ordenesAbiertas: Orden[];
  productos: Producto[];
  mesaSel: string | null;
  orden: Orden | null;
  items: OrdenItem[];
}) {
  if (!mesaSel) {
    return <MesasGrid mesas={mesas} ordenes={ordenesAbiertas} />;
  }
  return (
    <OrdenView
      rol={rol}
      mesa={mesaSel}
      orden={orden}
      items={items}
      productos={productos}
    />
  );
}

// ── Cuadrícula de mesas ───────────────────────────────────────
function MesasGrid({ mesas, ordenes }: { mesas: Mesa[]; ordenes: Orden[] }) {
  const ocupada = new Map(ordenes.map((o) => [o.mesa_nombre, o]));
  return (
    <div className="caja-page">
      <header className="caja-head">
        <h1>POS · Mesas</h1>
        <p className="caja-head__sub">Toca una mesa para tomar o ver su pedido.</p>
      </header>
      {mesas.length === 0 ? (
        <div className="caja-empty">
          <p>No hay mesas configuradas. Pídele al dueño que las agregue en Ajustes.</p>
        </div>
      ) : (
        <div className="caja-mesas">
          {mesas
            .filter((m) => m.activa)
            .map((m) => {
              const o = ocupada.get(m.nombre);
              return (
                <Link
                  key={m.id}
                  href={`/admin/pos?mesa=${encodeURIComponent(m.nombre)}`}
                  className={`caja-mesa ${o ? "is-ocupada" : ""}`}
                >
                  <span className="caja-mesa__nombre">{m.nombre}</span>
                  {o ? (
                    <span className="caja-mesa__total">{mxnCorto(o.total)}</span>
                  ) : (
                    <span className="caja-mesa__libre">Libre</span>
                  )}
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
}

// ── Vista de una orden ────────────────────────────────────────
function OrdenView({
  rol,
  mesa,
  orden,
  items,
  productos,
}: {
  rol: Rol;
  mesa: string;
  orden: Orden | null;
  items: OrdenItem[];
  productos: Producto[];
}) {
  const router = useRouter();
  const { toast, confirm } = useFeedback();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [busca, setBusca] = useState("");
  const [cobroOpen, setCobroOpen] = useState(false);
  const [persItem, setPersItem] = useState<OrdenItem | null>(null);

  const categorias = useMemo(
    () => Array.from(new Set(productos.map((p) => p.categoria))),
    [productos]
  );
  const [cat, setCat] = useState(categorias[0] ?? "");

  const visibles = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (q) return productos.filter((p) => p.nombre.toLowerCase().includes(q));
    return productos.filter((p) => p.categoria === cat);
  }, [productos, busca, cat]);

  const total = items.reduce((a, i) => a + i.precio_unit * i.cantidad, 0);
  const porEnviar = items.some((i) => !i.enviado_cocina);

  async function call(body: Record<string, unknown>, method = "PATCH") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pos/ordenes", {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Algo salió mal.");
        return null;
      }
      router.refresh();
      return data;
    } finally {
      setBusy(false);
    }
  }

  async function ensureOrden(): Promise<string | null> {
    if (orden) return orden.id;
    const res = await fetch("/api/admin/pos/ordenes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mesa_nombre: mesa }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "No se pudo abrir la cuenta.");
      return null;
    }
    return data.orden?.id ?? null;
  }

  async function agregar(p: Producto) {
    setBusy(true);
    setError("");
    const id = await ensureOrden();
    if (!id) {
      setBusy(false);
      return;
    }
    await fetch("/api/admin/pos/ordenes", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id,
        action: "agregar",
        producto_id: p.id,
        nombre: p.nombre,
        precio_unit: p.precio,
        cantidad: 1,
      }),
    });
    setBusy(false);
    router.refresh();
  }

  function cambiarCantidad(it: OrdenItem, delta: number) {
    if (!orden) return;
    call({ id: orden.id, action: "item_cantidad", item_id: it.id, cantidad: it.cantidad + delta });
  }

  async function guardarNota(nota: string) {
    if (!orden || !persItem) return;
    setPersItem(null);
    const r = await call({ id: orden.id, action: "item_nota", item_id: persItem.id, nota });
    if (r?.ok) toast.success(nota ? "Platillo personalizado" : "Indicación quitada");
  }

  async function enviarCocina() {
    if (!orden) return;
    const r = await call({ id: orden.id, action: "enviar_cocina" });
    if (r?.ok) toast.success("Comanda enviada a cocina");
  }

  async function cancelar() {
    if (!orden) return;
    const ok = await confirm({
      title: "¿Cancelar esta cuenta?",
      message: "Se borrará lo que lleva la mesa.",
      confirmLabel: "Sí, cancelar",
      danger: true,
    });
    if (!ok) return;
    const r = await call({ id: orden.id, action: "cancelar" });
    if (r?.ok) {
      toast.info("Cuenta cancelada");
      router.push("/admin/pos");
    }
  }

  async function confirmarCobro(forma: "efectivo" | "tarjeta") {
    if (!orden) return;
    setCobroOpen(false);
    const r = await call({ id: orden.id, action: "cobrar", forma_pago: forma });
    if (r?.ok) {
      toast.success(`Cobrado ${mxn(total)} en ${forma}`);
      router.push("/admin/pos");
    }
  }

  return (
    <div className="caja-page caja-pos">
      <header className="caja-head caja-head--row">
        <div>
          <Link href="/admin/pos" className="caja-link caja-link--icon"><Icon name="volver" size={15} /> Mesas</Link>
          <h1>{mesa}</h1>
        </div>
        {orden && (
          <div className="caja-head__cta">
            <button className="caja-btn caja-btn--ghost caja-btn--sm" disabled={busy} onClick={cancelar}>
              Cancelar cuenta
            </button>
          </div>
        )}
      </header>

      {error && <p className="caja-error">{error}</p>}

      <div className="caja-pos__grid">
        {/* Carta */}
        <section className="caja-card caja-pos__carta">
          <input
            className="caja-pos__buscar"
            placeholder="Buscar platillo…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {!busca && (
            <div className="caja-pos__tabs">
              {categorias.map((c) => (
                <button
                  key={c}
                  className={`caja-pos__tab ${c === cat ? "is-active" : ""}`}
                  onClick={() => setCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          <div className="caja-pos__productos">
            {visibles.map((p) => (
              <button key={p.id} className="caja-prod" disabled={busy} onClick={() => agregar(p)}>
                <span className="caja-prod__nombre">{p.nombre}</span>
                <span className="caja-prod__precio">{mxnCorto(p.precio)}</span>
              </button>
            ))}
            {visibles.length === 0 && <p className="caja-muted">Sin resultados.</p>}
          </div>
        </section>

        {/* Cuenta */}
        <section className="caja-card caja-pos__cuenta">
          <h3 className="caja-card__title">La cuenta</h3>
          {items.length === 0 ? (
            <p className="caja-muted">Toca platillos de la carta para agregarlos.</p>
          ) : (
            <ul className="caja-cuenta">
              {items.map((it) => (
                <li key={it.id} className="caja-cuenta__row">
                  <div className="caja-cuenta__main">
                    <div className="caja-cuenta__info">
                      {it.enviado_cocina ? (
                        <span className="caja-cuenta__qty">{it.cantidad}×</span>
                      ) : (
                        <span className="caja-stepper">
                          <button disabled={busy} aria-label="Quitar uno" onClick={() => cambiarCantidad(it, -1)}>−</button>
                          <span className="caja-stepper__val">{it.cantidad}</span>
                          <button disabled={busy} aria-label="Agregar uno" onClick={() => cambiarCantidad(it, 1)}>+</button>
                        </span>
                      )}
                      <span className="caja-cuenta__nombre">
                        {it.nombre}
                        {it.enviado_cocina && (
                          <span className={`caja-tag ${it.estado === "listo" ? "caja-tag--listo" : "caja-tag--cocina"}`}>
                            {it.estado === "listo" ? "listo" : "en cocina"}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="caja-cuenta__der">
                      <span>{mxnCorto(it.precio_unit * it.cantidad)}</span>
                    </div>
                  </div>
                  {it.nota && (
                    <p className="caja-cuenta__nota"><Icon name="editar" size={12} /> {it.nota}</p>
                  )}
                  {!it.enviado_cocina && (
                    <button
                      type="button"
                      className="caja-cuenta__pers"
                      disabled={busy}
                      onClick={() => setPersItem(it)}
                    >
                      <Icon name="editar" size={13} /> {it.nota ? "Editar indicaciones" : "Personalizar"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="caja-cuenta__total">
            <span>Total</span>
            <strong>{mxn(total)}</strong>
          </div>

          <div className="caja-pos__acciones">
            <button
              className="caja-btn caja-btn--ghost caja-btn--lg"
              disabled={busy || !porEnviar}
              onClick={enviarCocina}
            >
              <Icon name="cocina" size={18} /> Enviar a cocina
            </button>
            <button
              className="caja-btn caja-btn--primary caja-btn--lg"
              disabled={busy || total <= 0}
              onClick={() => setCobroOpen(true)}
            >
              Cobrar {mxnCorto(total)}
            </button>
          </div>
        </section>
      </div>

      {cobroOpen && orden && (
        <CobroModal
          total={total}
          busy={busy}
          onClose={() => setCobroOpen(false)}
          onCobrar={confirmarCobro}
        />
      )}

      {persItem && (
        <PersonalizarModal
          key={persItem.id}
          item={persItem}
          busy={busy}
          onClose={() => setPersItem(null)}
          onSave={guardarNota}
        />
      )}
    </div>
  );
}

// ── Modal de personalización (sin cebolla, sin crema, etc.) ───
// Las indicaciones se guardan en `nota` y se ven en la comanda de cocina.
const QUITABLES = [
  "Sin cebolla",
  "Sin crema",
  "Sin queso",
  "Sin chile",
  "Sin cilantro",
  "Sin frijoles",
  "Sin lechuga",
  "Sin jitomate",
  "Sin picante",
  "Sin salsa",
];
const EXTRAS = ["Para llevar", "Salsa aparte", "Bien dorado", "Poco picante"];
const TODAS = [...QUITABLES, ...EXTRAS];

function PersonalizarModal({
  item,
  busy,
  onClose,
  onSave,
}: {
  item: OrdenItem;
  busy: boolean;
  onClose: () => void;
  onSave: (nota: string) => void;
}) {
  // Separa la nota existente en chips conocidos + texto libre.
  const inicial = useMemo(() => {
    const set = new Set<string>();
    const libre: string[] = [];
    for (const parte of (item.nota ?? "").split(",").map((s) => s.trim()).filter(Boolean)) {
      const match = TODAS.find((c) => c.toLowerCase() === parte.toLowerCase());
      if (match) set.add(match);
      else libre.push(parte);
    }
    return { set, libre: libre.join(", ") };
  }, [item.nota]);

  const [chips, setChips] = useState<Set<string>>(inicial.set);
  const [libre, setLibre] = useState(inicial.libre);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function toggle(c: string) {
    setChips((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  function guardar() {
    const orden = TODAS.filter((c) => chips.has(c));
    const extra = libre.trim();
    onSave([...orden, ...(extra ? [extra] : [])].join(", "));
  }

  return (
    <div className="caja-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="caja-modal__card caja-modal__card--ancho" role="dialog" aria-modal="true" aria-label="Personalizar platillo">
        <h3 className="caja-modal__title">Personalizar</h3>
        <p className="caja-modal__msg">{item.cantidad}× {item.nombre}</p>

        <div className="caja-pers">
          <span className="caja-pers__lbl">Toca lo que se quita o se indica</span>
          <div className="caja-perschips">
            {TODAS.map((c) => (
              <button
                key={c}
                type="button"
                className={`caja-perschip ${chips.has(c) ? "is-on" : ""}`}
                onClick={() => toggle(c)}
              >
                {chips.has(c) && <Icon name="check" size={13} />} {c}
              </button>
            ))}
          </div>
          <label className="caja-field" style={{ marginTop: "0.9rem" }}>
            <span>Otra indicación (opcional)</span>
            <input
              value={libre}
              onChange={(e) => setLibre(e.target.value)}
              placeholder="Ej. término medio, sin sal…"
            />
          </label>
        </div>

        <div className="caja-modal__acciones">
          {item.nota && (
            <button className="caja-btn caja-btn--ghost" disabled={busy} onClick={() => onSave("")}>
              Quitar indicaciones
            </button>
          )}
          <button className="caja-btn caja-btn--ghost" disabled={busy} onClick={onClose}>
            Cancelar
          </button>
          <button className="caja-btn caja-btn--primary" disabled={busy} onClick={guardar}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal de cobro (efectivo con ayuda de cambio / tarjeta) ───
function CobroModal({
  total,
  busy,
  onClose,
  onCobrar,
}: {
  total: number;
  busy: boolean;
  onClose: () => void;
  onCobrar: (forma: "efectivo" | "tarjeta") => void;
}) {
  const [paga, setPaga] = useState("");
  const cambio = paga === "" ? null : Number(paga) - total;

  return (
    <div className="caja-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="caja-modal__card" role="dialog" aria-modal="true" aria-label="Cobrar">
        <h3 className="caja-modal__title">Cobrar cuenta</h3>
        <div className="caja-cobro__total">
          <span>Total a cobrar</span>
          <strong>{mxn(total)}</strong>
        </div>

        <label className="caja-field">
          <span>¿Con cuánto paga? (efectivo, opcional)</span>
          <input
            type="number"
            inputMode="decimal"
            value={paga}
            placeholder="$"
            onChange={(e) => setPaga(e.target.value)}
            autoFocus
          />
        </label>
        {cambio !== null && cambio >= 0 && (
          <div className="caja-cobro__cambio">Cambio: {mxn(cambio)}</div>
        )}
        {cambio !== null && cambio < 0 && (
          <div className="caja-error" style={{ marginTop: "0.4rem" }}>Falta {mxn(Math.abs(cambio))}</div>
        )}

        <div className="caja-pos__acciones" style={{ marginTop: "1.1rem" }}>
          <button className="caja-btn caja-btn--primary caja-btn--lg" disabled={busy} onClick={() => onCobrar("efectivo")}>
            <Icon name="efectivo" size={18} /> Cobrar en efectivo
          </button>
          <button className="caja-btn caja-btn--ghost caja-btn--lg" disabled={busy} onClick={() => onCobrar("tarjeta")}>
            <Icon name="tarjeta" size={18} /> Cobrar con tarjeta
          </button>
          <button className="caja-btn caja-btn--ghost" disabled={busy} onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
