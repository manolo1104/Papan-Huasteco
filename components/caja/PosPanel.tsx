"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Rol } from "@/lib/caja/auth";
import type { FormaCobro, Mesa, Orden, OrdenItem, Producto } from "@/lib/caja/types";
import { mxn, mxnCorto } from "@/lib/caja/format";
import { gruposPara, QUITABLES, EXTRAS } from "@/lib/caja/personalizacion";
import { abrirTicket } from "@/lib/caja/ticket-html";
import { useFeedback } from "@/components/caja/ui/Feedback";
import { Icon } from "@/components/caja/ui/Icon";

/** Datos extra que acompañan un cobro (según la forma de pago). */
export interface DatosCobro {
  forma: FormaCobro;
  personas: number | null;
  pago_recibido: number | null;
  pago_referencia: string | null;
  comprobante_url: string | null;
}

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
  // ── Blindaje contra el Router Cache de Next ──────────────────
  // Si el navegador reutilizó un payload viejo (de OTRA mesa), la URL real y
  // lo que el servidor renderizó no coinciden: se refresca y NUNCA se pinta
  // la cuenta equivocada. (Bug reportado: "te manda a los pedidos con la
  // misma cuenta".)
  const params = useSearchParams();
  const router = useRouter();
  const urlMesa = params.get("mesa");
  const desfasado = (urlMesa ?? null) !== (mesaSel ?? null);
  useEffect(() => {
    if (desfasado) router.refresh();
  }, [desfasado, router]);
  if (desfasado) {
    return (
      <div className="caja-page">
        <p className="caja-muted" style={{ padding: "2rem 0" }}>Cargando mesa…</p>
      </div>
    );
  }

  if (!mesaSel) {
    return <MesasGrid mesas={mesas} ordenes={ordenesAbiertas} />;
  }
  return (
    <OrdenView
      key={mesaSel}
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
  const { toast, confirm, prompt } = useFeedback();
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
        // mesa_nombre viaja SIEMPRE: el servidor rechaza la operación si la
        // orden no es de esta mesa (candado contra cuentas cruzadas).
        body: JSON.stringify({ mesa_nombre: mesa, ...body }),
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

  async function editarPersonas() {
    if (!orden) return;
    const v = await prompt({
      title: "¿Cuántas personas hay en la mesa?",
      label: "Número de personas",
      type: "number",
      defaultValue: orden.personas ? String(orden.personas) : "",
      placeholder: "Ej. 4",
      confirmLabel: "Guardar",
    });
    if (v === null) return;
    const r = await call({ id: orden.id, action: "set_personas", personas: Number(v) });
    if (r?.ok) toast.success(r.personas ? `${r.personas} personas en la mesa` : "Personas sin capturar");
  }

  /** Pide el PIN de cancelaciones. Devuelve el PIN o null si se canceló. */
  async function pedirPin(titulo: string): Promise<string | null> {
    return prompt({
      title: titulo,
      message: "Esta acción requiere el PIN de cancelaciones y queda en la bitácora.",
      label: "PIN",
      type: "number",
      placeholder: "••••",
      confirmLabel: "Confirmar",
    });
  }

  async function borrarItemEnviado(it: OrdenItem) {
    if (!orden) return;
    const pin = await pedirPin(`Cancelar ${it.cantidad}× ${it.nombre}`);
    if (pin === null) return;
    const r = await call({ id: orden.id, action: "borrar_item", item_id: it.id, pin });
    if (r?.ok) toast.info("Platillo cancelado (quedó en la bitácora)");
  }

  function descargarCuenta() {
    abrirTicket({
      mesa,
      personas: orden?.personas ?? null,
      mesero: orden?.mesero ?? rol,
      items,
      total,
      orden,
    });
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
      message: "Se borrará lo que lleva la mesa. Se pedirá el PIN de cancelaciones.",
      confirmLabel: "Sí, cancelar",
      danger: true,
    });
    if (!ok) return;
    const pin = await pedirPin("Cancelar la cuenta completa");
    if (pin === null) return;
    const r = await call({ id: orden.id, action: "cancelar", pin });
    if (r?.ok) {
      toast.info("Cuenta cancelada (quedó en la bitácora)");
      router.push("/admin/pos");
    }
  }

  async function confirmarCobro(datos: DatosCobro) {
    if (!orden) return;
    const r = await call({
      id: orden.id,
      action: "cobrar",
      forma_pago: datos.forma,
      personas: datos.personas,
      pago_recibido: datos.pago_recibido,
      pago_referencia: datos.pago_referencia,
      comprobante_url: datos.comprobante_url,
    });
    if (r?.ok) {
      setCobroOpen(false);
      const etiqueta =
        datos.forma === "booking" ? "a la cuenta del hotel (booking)" : `en ${datos.forma}`;
      toast.success(`Cobrado ${mxn(total)} ${etiqueta}`);
      router.push("/admin/pos");
      return true;
    }
    return false;
  }

  return (
    <div className="caja-page caja-pos">
      <header className="caja-head caja-head--row">
        <div>
          <Link href="/admin/pos" className="caja-link caja-link--icon"><Icon name="volver" size={15} /> Mesas</Link>
          <h1>
            {mesa}
            {orden && (
              <button
                type="button"
                className="caja-personas-chip"
                disabled={busy}
                onClick={editarPersonas}
                title="Número de personas en la mesa"
              >
                👥 {orden.personas ? `${orden.personas}` : "¿personas?"}
              </button>
            )}
          </h1>
        </div>
        {orden && (
          <div className="caja-head__cta">
            {items.length > 0 && (
              <button className="caja-btn caja-btn--ghost caja-btn--sm" disabled={busy} onClick={descargarCuenta}>
                <Icon name="imprimir" size={15} /> Cuenta PDF
              </button>
            )}
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
                      {it.enviado_cocina && (
                        <button
                          type="button"
                          className="caja-cuenta__cancelitem"
                          disabled={busy}
                          title="Cancelar este platillo (pide PIN)"
                          aria-label={`Cancelar ${it.nombre}`}
                          onClick={() => borrarItemEnviado(it)}
                        >
                          ✕
                        </button>
                      )}
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
          personasInicial={orden.personas}
          busy={busy}
          onClose={() => setCobroOpen(false)}
          onCobrar={confirmarCobro}
          onError={(m) => setError(m)}
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

// ── Modal de personalización ──────────────────────────────────
// Grupos según el platillo (sabor de licuado, término de la carne, etc.,
// definidos en lib/caja/personalizacion.ts) + chips genéricas + texto libre.
// Todo se guarda en `nota` y se ve en la comanda de cocina.
const CHIPS_GENERICAS = [...QUITABLES, ...EXTRAS];

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
  const grupos = useMemo(() => gruposPara(item.nombre), [item.nombre]);
  const opcionesDeGrupos = useMemo(() => grupos.flatMap((g) => g.opciones), [grupos]);
  const conocidas = useMemo(
    () => [...opcionesDeGrupos, ...CHIPS_GENERICAS],
    [opcionesDeGrupos]
  );

  // Separa la nota existente en selecciones de grupo + chips + texto libre.
  const inicial = useMemo(() => {
    const sel = new Map<string, string>(); // titulo de grupo -> opción
    const set = new Set<string>();
    const libre: string[] = [];
    for (const parte of (item.nota ?? "").split(",").map((s) => s.trim()).filter(Boolean)) {
      const grupo = grupos.find((g) =>
        g.opciones.some((o) => o.toLowerCase() === parte.toLowerCase())
      );
      if (grupo) {
        const op = grupo.opciones.find((o) => o.toLowerCase() === parte.toLowerCase())!;
        sel.set(grupo.titulo, op);
        continue;
      }
      const chip = CHIPS_GENERICAS.find((c) => c.toLowerCase() === parte.toLowerCase());
      if (chip) set.add(chip);
      else libre.push(parte);
    }
    return { sel, set, libre: libre.join(", ") };
  }, [item.nota, grupos]);

  const [seleccion, setSeleccion] = useState<Map<string, string>>(inicial.sel);
  const [chips, setChips] = useState<Set<string>>(inicial.set);
  const [libre, setLibre] = useState(inicial.libre);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function elegir(grupo: string, opcion: string) {
    setSeleccion((prev) => {
      const next = new Map(prev);
      if (next.get(grupo) === opcion) next.delete(grupo); // tocar de nuevo = quitar
      else next.set(grupo, opcion);
      return next;
    });
  }

  function toggle(c: string) {
    setChips((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  function guardar() {
    const deGrupos = grupos
      .map((g) => seleccion.get(g.titulo))
      .filter((x): x is string => Boolean(x));
    const genericas = CHIPS_GENERICAS.filter((c) => chips.has(c));
    const extra = libre.trim();
    onSave([...deGrupos, ...genericas, ...(extra ? [extra] : [])].join(", "));
  }

  return (
    <div className="caja-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="caja-modal__card caja-modal__card--ancho" role="dialog" aria-modal="true" aria-label="Personalizar platillo">
        <h3 className="caja-modal__title">Personalizar</h3>
        <p className="caja-modal__msg">{item.cantidad}× {item.nombre}</p>

        <div className="caja-pers">
          {grupos.map((g) => (
            <div key={g.titulo} className="caja-pers__grupo">
              <span className="caja-pers__lbl">{g.titulo} <em>(elige una)</em></span>
              <div className="caja-perschips">
                {g.opciones.map((o) => {
                  const on = seleccion.get(g.titulo) === o;
                  return (
                    <button
                      key={o}
                      type="button"
                      className={`caja-perschip ${on ? "is-on" : ""}`}
                      onClick={() => elegir(g.titulo, o)}
                    >
                      {on && <Icon name="check" size={13} />} {o}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <span className="caja-pers__lbl" style={grupos.length ? { marginTop: "0.9rem", display: "inline-block" } : undefined}>
            Toca lo que se quita o se indica
          </span>
          <div className="caja-perschips">
            {CHIPS_GENERICAS.map((c) => (
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
              placeholder="Ej. sin sal, poco aceite…"
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

// ── Modal de cobro ────────────────────────────────────────────
// Flujo: total → personas → ¿con cuánto paga? → elegir método.
// Tarjeta/transferencia permiten adjuntar la foto del voucher (Clip);
// booking pide la referencia del huésped (la paga el hotel después).
function CobroModal({
  total,
  personasInicial,
  busy,
  onClose,
  onCobrar,
  onError,
}: {
  total: number;
  personasInicial: number | null;
  busy: boolean;
  onClose: () => void;
  onCobrar: (datos: DatosCobro) => Promise<boolean | undefined>;
  onError: (msg: string) => void;
}) {
  const [paso, setPaso] = useState<"datos" | "tarjeta" | "transferencia" | "booking">("datos");
  const [personas, setPersonas] = useState(personasInicial ? String(personasInicial) : "");
  const [paga, setPaga] = useState("");
  const [referencia, setReferencia] = useState("");
  const [voucher, setVoucher] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const cambio = paga === "" ? null : Number(paga) - total;

  const personasNum = (() => {
    const n = Math.floor(Number(personas));
    return Number.isFinite(n) && n > 0 ? n : null;
  })();

  async function subirVoucher(): Promise<string | null> {
    if (!voucher) return null;
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append("file", voucher);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onError(data.error || "No se pudo subir el voucher.");
        return null;
      }
      return data.url ?? null;
    } finally {
      setSubiendo(false);
    }
  }

  async function cobrar(forma: FormaCobro) {
    let comprobante: string | null = null;
    if ((forma === "tarjeta" || forma === "transferencia") && voucher) {
      comprobante = await subirVoucher();
      if (voucher && !comprobante) return; // falló la subida: no cobrar a ciegas
    }
    await onCobrar({
      forma,
      personas: personasNum,
      pago_recibido: forma === "efectivo" && paga !== "" ? Number(paga) : null,
      pago_referencia: forma === "booking" && referencia.trim() ? referencia.trim() : null,
      comprobante_url: comprobante,
    });
  }

  const ocupado = busy || subiendo;

  return (
    <div className="caja-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="caja-modal__card" role="dialog" aria-modal="true" aria-label="Cobrar">
        <h3 className="caja-modal__title">Cobrar cuenta</h3>
        <div className="caja-cobro__total">
          <span>Total a cobrar</span>
          <strong>{mxn(total)}</strong>
        </div>

        {paso === "datos" && (
          <>
            <label className="caja-field">
              <span>¿Cuántas personas comieron?</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={personas}
                placeholder="Ej. 4"
                onChange={(e) => setPersonas(e.target.value)}
              />
            </label>

            <label className="caja-field">
              <span>¿Con cuánto paga? (si es efectivo)</span>
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
              <button
                className="caja-btn caja-btn--primary caja-btn--lg"
                disabled={ocupado || (cambio !== null && cambio < 0)}
                onClick={() => cobrar("efectivo")}
              >
                <Icon name="efectivo" size={18} /> Cobrar en efectivo
              </button>
              <button className="caja-btn caja-btn--ghost caja-btn--lg" disabled={ocupado} onClick={() => setPaso("tarjeta")}>
                <Icon name="tarjeta" size={18} /> Tarjeta
              </button>
              <button className="caja-btn caja-btn--ghost caja-btn--lg" disabled={ocupado} onClick={() => setPaso("transferencia")}>
                Transferencia
              </button>
              <button className="caja-btn caja-btn--ghost caja-btn--lg" disabled={ocupado} onClick={() => setPaso("booking")}>
                Booking (hotel)
              </button>
              <button className="caja-btn caja-btn--ghost" disabled={ocupado} onClick={onClose}>
                Cancelar
              </button>
            </div>
          </>
        )}

        {(paso === "tarjeta" || paso === "transferencia") && (
          <>
            <p className="caja-modal__msg" style={{ marginTop: "0.6rem" }}>
              {paso === "tarjeta"
                ? "Cobra en la terminal (Clip) y, si quieres, adjunta la foto del voucher."
                : "Confirma la transferencia recibida y, si quieres, adjunta el comprobante."}
            </p>
            <label className="caja-field">
              <span>Foto del voucher / comprobante (opcional)</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                onChange={(e) => setVoucher(e.target.files?.[0] ?? null)}
              />
            </label>
            <div className="caja-pos__acciones" style={{ marginTop: "1.1rem" }}>
              <button className="caja-btn caja-btn--primary caja-btn--lg" disabled={ocupado} onClick={() => cobrar(paso)}>
                {subiendo ? "Subiendo voucher…" : `Confirmar cobro con ${paso}`}
              </button>
              <button className="caja-btn caja-btn--ghost" disabled={ocupado} onClick={() => setPaso("datos")}>
                Volver
              </button>
            </div>
          </>
        )}

        {paso === "booking" && (
          <>
            <p className="caja-modal__msg" style={{ marginTop: "0.6rem" }}>
              La cuenta se carga al hotel (huésped con alimentos incluidos). NO entra
              dinero a la caja; el administrador del hotel la paga después.
            </p>
            <label className="caja-field">
              <span>Habitación o nombre del huésped (recomendado)</span>
              <input
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ej. Hab. 12 · Familia García"
                autoFocus
              />
            </label>
            <div className="caja-pos__acciones" style={{ marginTop: "1.1rem" }}>
              <button className="caja-btn caja-btn--primary caja-btn--lg" disabled={ocupado} onClick={() => cobrar("booking")}>
                Cargar a booking
              </button>
              <button className="caja-btn caja-btn--ghost" disabled={ocupado} onClick={() => setPaso("datos")}>
                Volver
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
