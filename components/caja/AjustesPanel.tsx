"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Categoria } from "@/lib/caja/types";
import { useFeedback } from "@/components/caja/ui/Feedback";
import { Icon } from "@/components/caja/ui/Icon";

export default function AjustesPanel({
  categorias,
  conceptos,
  mes,
  metaActual,
  pinConfigurado,
}: {
  categorias: Categoria[];
  conceptos: Categoria[];
  mes: string;
  metaActual: number;
  pinConfigurado: boolean;
}) {
  const router = useRouter();
  const { toast } = useFeedback();
  const [meta, setMeta] = useState(metaActual ? String(metaActual) : "");
  const [savingMeta, setSavingMeta] = useState(false);
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [savingPin, setSavingPin] = useState(false);

  async function guardarPin(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{4,8}$/.test(pin.trim()))
      return toast.error("El PIN debe ser de 4 a 8 dígitos.");
    if (pin.trim() !== pin2.trim()) return toast.error("Los PIN no coinciden.");
    setSavingPin(true);
    const res = await fetch("/api/admin/config", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pin: pin.trim() }),
    });
    setSavingPin(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return toast.error(d.error || "No se pudo guardar el PIN.");
    }
    setPin("");
    setPin2("");
    toast.success("PIN de cancelaciones guardado");
    router.refresh();
  }

  async function guardarMeta(e: React.FormEvent) {
    e.preventDefault();
    setSavingMeta(true);
    const res = await fetch("/api/admin/metas", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mes, meta_ventas: meta === "" ? 0 : Number(meta) }),
    });
    setSavingMeta(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return toast.error(d.error || "No se pudo guardar la meta.");
    }
    toast.success("Meta guardada");
    router.refresh();
  }

  return (
    <div className="caja-page">
      <header className="caja-head">
        <h1>Ajustes</h1>
        <p className="caja-head__sub">
          Administra tus rubros (categorías y conceptos de gasto) y la meta de
          ventas del mes.
        </p>
      </header>

      <section className="caja-card">
        <h3 className="caja-card__title">Meta de ventas ({mes})</h3>
        <form className="caja-form caja-form--grid" onSubmit={guardarMeta}>
          <label className="caja-field">
            <span>Meta del mes (MXN)</span>
            <input
              type="number"
              min="0"
              step="100"
              inputMode="decimal"
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              placeholder="$ que quieres vender este mes"
            />
          </label>
          <div className="caja-form__full">
            <button className="caja-btn caja-btn--primary" disabled={savingMeta}>
              {savingMeta ? "Guardando…" : "Guardar meta"}
            </button>
          </div>
        </form>
      </section>

      <section className="caja-card">
        <h3 className="caja-card__title">PIN de cancelaciones</h3>
        <p className="caja-muted" style={{ marginBottom: "0.8rem" }}>
          {pinConfigurado
            ? "Ya hay un PIN configurado. Cancelar una cuenta o quitar un platillo ya enviado a cocina lo pide, y el movimiento queda en la bitácora. Aquí puedes cambiarlo."
            : "⚠ Aún no hay PIN. Sin él, NADIE puede cancelar cuentas ni quitar platillos ya enviados a cocina. Define uno de 4 a 8 dígitos."}
        </p>
        <form className="caja-form caja-form--grid" onSubmit={guardarPin}>
          <label className="caja-field">
            <span>{pinConfigurado ? "Nuevo PIN" : "PIN"} (4 a 8 dígitos)</span>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
            />
          </label>
          <label className="caja-field">
            <span>Repite el PIN</span>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={8}
              value={pin2}
              onChange={(e) => setPin2(e.target.value)}
              placeholder="••••"
            />
          </label>
          <div className="caja-form__full">
            <button className="caja-btn caja-btn--primary" disabled={savingPin}>
              {savingPin ? "Guardando…" : pinConfigurado ? "Cambiar PIN" : "Guardar PIN"}
            </button>
          </div>
        </form>
      </section>

      <CatalogoEditor
        titulo="Categorías de gasto"
        descripcion="El grupo grande del gasto (Insumos, Nómina, Servicios…). Se usa en el estado de resultados."
        endpoint="/api/admin/categorias"
        singular="categoría"
        items={categorias}
        placeholder="Ej. Gas · Marketing · Bebidas"
      />

      <CatalogoEditor
        titulo="Conceptos de gasto"
        descripcion="El detalle exacto del gasto (Compra de carne, Tortillas, Luz…). En /gastos se elige de esta lista para que siempre se escriba igual."
        endpoint="/api/admin/conceptos"
        singular="concepto"
        items={conceptos}
        placeholder="Ej. Compra de carne · Tortillas · Gas"
      />
    </div>
  );
}

// ── Editor reusable de un catálogo (categorías / conceptos) ───
function CatalogoEditor({
  titulo,
  descripcion,
  endpoint,
  singular,
  items,
  placeholder,
}: {
  titulo: string;
  descripcion: string;
  endpoint: string;
  singular: string;
  items: Categoria[];
  placeholder: string;
}) {
  const router = useRouter();
  const { toast, confirm, prompt } = useFeedback();
  const [nueva, setNueva] = useState("");

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    if (!nueva.trim()) return;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label: nueva }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(d.error || "No se pudo agregar.");
    setNueva("");
    toast.success(`${cap(singular)} agregada`);
    router.refresh();
  }

  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    if (res.ok) router.refresh();
    else toast.error("No se pudo actualizar.");
  }

  async function renombrar(c: Categoria) {
    const nombre = await prompt({
      title: `Renombrar ${singular}`,
      label: "Nuevo nombre",
      defaultValue: c.label,
    });
    if (!nombre || !nombre.trim()) return;
    patch(c.id, { label: nombre.trim() });
  }

  async function borrar(id: string) {
    const ok = await confirm({
      title: `¿Borrar este ${singular}?`,
      message: "Los gastos que ya lo usan conservan su etiqueta.",
      confirmLabel: "Borrar",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`${cap(singular)} borrada`);
      router.refresh();
    } else toast.error("No se pudo borrar.");
  }

  return (
    <section className="caja-card">
      <h3 className="caja-card__title">{titulo}</h3>
      <p className="caja-muted" style={{ marginBottom: "0.8rem" }}>{descripcion}</p>
      <ul className="caja-list">
        {items.map((c) => (
          <li key={c.id} className="caja-list__row">
            <div>
              <strong style={{ opacity: c.activo ? 1 : 0.5 }}>{c.label}</strong>
              {!c.activo && <span className="caja-muted"> · oculto</span>}
            </div>
            <div className="caja-evento__acciones">
              <button className="caja-btn caja-btn--sm caja-btn--ghost" onClick={() => renombrar(c)}>
                Renombrar
              </button>
              <button className="caja-btn caja-btn--sm caja-btn--ghost" onClick={() => patch(c.id, { activo: !c.activo })}>
                {c.activo ? "Ocultar" : "Mostrar"}
              </button>
              <button className="caja-iconbtn" onClick={() => borrar(c.id)} title="Borrar"><Icon name="cerrar" size={15} /></button>
            </div>
          </li>
        ))}
      </ul>
      <form className="caja-form caja-form--grid caja-ajustes__add" onSubmit={agregar}>
        <label className="caja-field">
          <span>Agregar {singular}</span>
          <input value={nueva} onChange={(e) => setNueva(e.target.value)} placeholder={placeholder} />
        </label>
        <div className="caja-form__full">
          <button className="caja-btn caja-btn--primary">+ Agregar {singular}</button>
        </div>
      </form>
    </section>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
