"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Categoria } from "@/lib/caja/types";
import { useFeedback } from "@/components/caja/ui/Feedback";
import { Icon } from "@/components/caja/ui/Icon";

export default function AjustesPanel({
  categorias,
  mes,
  metaActual,
}: {
  categorias: Categoria[];
  mes: string;
  metaActual: number;
}) {
  const router = useRouter();
  const { toast, confirm, prompt } = useFeedback();
  const [meta, setMeta] = useState(metaActual ? String(metaActual) : "");
  const [nueva, setNueva] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

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

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    if (!nueva.trim()) return;
    const res = await fetch("/api/admin/categorias", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label: nueva }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(d.error || "No se pudo agregar.");
    setNueva("");
    toast.success("Categoría agregada");
    router.refresh();
  }

  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch("/api/admin/categorias", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    if (res.ok) router.refresh();
    else toast.error("No se pudo actualizar.");
  }

  async function renombrar(c: Categoria) {
    const nombre = await prompt({
      title: "Renombrar categoría",
      label: "Nuevo nombre",
      defaultValue: c.label,
    });
    if (!nombre || !nombre.trim()) return;
    patch(c.id, { label: nombre.trim() });
  }

  async function borrar(id: string) {
    const ok = await confirm({
      title: "¿Borrar esta categoría?",
      message: "Los gastos que ya la usan conservan su etiqueta.",
      confirmLabel: "Borrar",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/categorias?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Categoría borrada");
      router.refresh();
    } else toast.error("No se pudo borrar.");
  }

  return (
    <div className="caja-page">
      <header className="caja-head">
        <h1>Ajustes</h1>
        <p className="caja-head__sub">Tus categorías de gasto y la meta de ventas del mes.</p>
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
        <h3 className="caja-card__title">Categorías de gasto</h3>
        <ul className="caja-list">
          {categorias.map((c) => (
            <li key={c.id} className="caja-list__row">
              <div>
                <strong style={{ opacity: c.activo ? 1 : 0.5 }}>{c.label}</strong>
                {!c.activo && <span className="caja-muted"> · oculta</span>}
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
            <span>Nueva categoría</span>
            <input value={nueva} onChange={(e) => setNueva(e.target.value)} placeholder="Ej. Gas · Marketing · Bebidas" />
          </label>
          <div className="caja-form__full">
            <button className="caja-btn caja-btn--primary">Agregar categoría</button>
          </div>
        </form>
      </section>
    </div>
  );
}
