"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Insumo, Producto, Receta } from "@/lib/caja/types";
import { mxn, mxnCorto } from "@/lib/caja/format";
import { useFeedback } from "@/components/caja/ui/Feedback";

export default function InventarioPanel({
  insumos,
  productos,
  recetasPorProducto,
}: {
  insumos: Insumo[];
  productos: Producto[];
  recetasPorProducto: Record<string, Receta[]>;
}) {
  return (
    <div className="caja-page">
      <header className="caja-head">
        <h1>Inventario y recetas</h1>
        <p className="caja-head__sub">
          Tus insumos con stock y costo, y qué lleva cada platillo. Al cobrar un
          platillo con receta, el stock baja solo.
        </p>
      </header>
      <Insumos insumos={insumos} />
      <Recetas insumos={insumos} productos={productos} recetasPorProducto={recetasPorProducto} />
    </div>
  );
}

// ── Insumos ───────────────────────────────────────────────────
function Insumos({ insumos }: { insumos: Insumo[] }) {
  const router = useRouter();
  const { toast, confirm, prompt } = useFeedback();
  const [nombre, setNombre] = useState("");
  const [unidad, setUnidad] = useState("kg");
  const [costo, setCosto] = useState("");
  const [stock, setStock] = useState("");
  const [minimo, setMinimo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const bajos = insumos.filter((i) => i.stock_minimo > 0 && i.stock_actual <= i.stock_minimo);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/inventario/insumos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nombre,
        unidad,
        costo_unitario: costo === "" ? 0 : Number(costo),
        stock_actual: stock === "" ? 0 : Number(stock),
        stock_minimo: minimo === "" ? 0 : Number(minimo),
      }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(d.error || "No se pudo guardar.");
    setNombre(""); setCosto(""); setStock(""); setMinimo("");
    toast.success("Insumo agregado");
    router.refresh();
  }

  async function call(body: Record<string, unknown>) {
    const res = await fetch("/api/admin/inventario/insumos", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) router.refresh();
    else toast.error("No se pudo actualizar.");
  }

  async function entrada(i: Insumo) {
    const v = await prompt({
      title: `Entrada de stock · ${i.nombre}`,
      label: `¿Cuánto entró? (${i.unidad})`,
      type: "number",
      placeholder: "cantidad",
      confirmLabel: "Sumar al stock",
    });
    if (v == null) return;
    const cantidad = Number(v);
    if (!Number.isFinite(cantidad) || cantidad === 0) return;
    await call({ id: i.id, action: "entrada", cantidad });
    toast.success("Stock actualizado");
  }
  async function editarCosto(i: Insumo) {
    const v = await prompt({
      title: `Costo de ${i.nombre}`,
      label: `Costo por ${i.unidad} (MXN)`,
      type: "number",
      defaultValue: String(i.costo_unitario),
    });
    if (v == null) return;
    call({ id: i.id, costo_unitario: Number(v) || 0 });
  }
  async function editarMinimo(i: Insumo) {
    const v = await prompt({
      title: `Stock mínimo de ${i.nombre}`,
      label: "Te avisa cuando baje de aquí",
      type: "number",
      defaultValue: String(i.stock_minimo),
    });
    if (v == null) return;
    call({ id: i.id, stock_minimo: Number(v) || 0 });
  }
  async function borrar(id: string) {
    const ok = await confirm({
      title: "¿Borrar este insumo?",
      message: "Saldrá de las recetas que lo usen.",
      confirmLabel: "Borrar",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/inventario/insumos?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Insumo borrado");
      router.refresh();
    } else toast.error("No se pudo borrar.");
  }

  return (
    <section className="caja-card">
      <h3 className="caja-card__title">Insumos</h3>

      {bajos.length > 0 && (
        <div className="caja-banner caja-banner--rojo">
          <span className="caja-banner__dot" />
          <div>
            <strong>Stock bajo:</strong> {bajos.map((b) => b.nombre).join(", ")}. Conviene resurtir.
          </div>
        </div>
      )}

      {insumos.length === 0 ? (
        <p className="caja-muted">Aún no hay insumos. Agrega el primero abajo.</p>
      ) : (
        <div className="caja-table-wrap">
          <table className="caja-table">
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Unidad</th>
                <th className="num">Costo</th>
                <th className="num">Stock</th>
                <th className="num">Mínimo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {insumos.map((i) => {
                const bajo = i.stock_minimo > 0 && i.stock_actual <= i.stock_minimo;
                return (
                  <tr key={i.id}>
                    <td>{i.nombre}</td>
                    <td>{i.unidad}</td>
                    <td className="num">{mxnCorto(i.costo_unitario)}</td>
                    <td className={`num ${bajo ? "neg" : ""}`}>{i.stock_actual}{bajo ? " ⚠️" : ""}</td>
                    <td className="num">{i.stock_minimo}</td>
                    <td className="num caja-prod-acc">
                      <button className="caja-btn caja-btn--sm caja-btn--ghost" onClick={() => entrada(i)}>+ Stock</button>
                      <button className="caja-btn caja-btn--sm caja-btn--ghost" onClick={() => editarCosto(i)}>Costo</button>
                      <button className="caja-btn caja-btn--sm caja-btn--ghost" onClick={() => editarMinimo(i)}>Mínimo</button>
                      <button className="caja-iconbtn" title="Borrar" onClick={() => borrar(i.id)}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <form className="caja-form caja-form--grid caja-ajustes__add" onSubmit={crear}>
        <label className="caja-field">
          <span>Nuevo insumo</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Cecina, Huevo, Tortilla" />
        </label>
        <label className="caja-field">
          <span>Unidad</span>
          <input value={unidad} onChange={(e) => setUnidad(e.target.value)} placeholder="kg, lt, pza" />
        </label>
        <label className="caja-field">
          <span>Costo por unidad</span>
          <input type="number" min="0" step="0.01" value={costo} onChange={(e) => setCosto(e.target.value)} placeholder="$" />
        </label>
        <label className="caja-field">
          <span>Stock inicial</span>
          <input type="number" min="0" step="0.01" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="cantidad" />
        </label>
        <label className="caja-field">
          <span>Stock mínimo (alerta)</span>
          <input type="number" min="0" step="0.01" value={minimo} onChange={(e) => setMinimo(e.target.value)} placeholder="opcional" />
        </label>
        <div className="caja-form__full">
          {error && <p className="caja-error">{error}</p>}
          <button className="caja-btn caja-btn--primary" disabled={busy}>Agregar insumo</button>
        </div>
      </form>
    </section>
  );
}

// ── Recetas ───────────────────────────────────────────────────
function Recetas({
  insumos,
  productos,
  recetasPorProducto,
}: {
  insumos: Insumo[];
  productos: Producto[];
  recetasPorProducto: Record<string, Receta[]>;
}) {
  const router = useRouter();
  const { toast } = useFeedback();
  const [prodId, setProdId] = useState(productos[0]?.id ?? "");
  const [insId, setInsId] = useState(insumos[0]?.id ?? "");
  const [cant, setCant] = useState("");

  const insumoDe = useMemo(() => new Map(insumos.map((i) => [i.id, i])), [insumos]);
  const receta = recetasPorProducto[prodId] ?? [];
  const producto = productos.find((p) => p.id === prodId);
  const costo = receta.reduce((a, r) => a + r.cantidad * (insumoDe.get(r.insumo_id)?.costo_unitario ?? 0), 0);

  async function set(insumo_id: string, cantidad: number) {
    const res = await fetch("/api/admin/inventario/recetas", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ producto_id: prodId, insumo_id, cantidad }),
    });
    if (res.ok) router.refresh();
    else toast.error("No se pudo guardar la receta.");
  }

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    if (!prodId || !insId) return;
    const cantidad = Number(cant);
    if (!Number.isFinite(cantidad) || cantidad <= 0) return toast.error("Cantidad no válida.");
    await set(insId, cantidad);
    setCant("");
  }

  if (productos.length === 0) {
    return (
      <section className="caja-card">
        <h3 className="caja-card__title">Recetas</h3>
        <p className="caja-muted">Primero importa tus productos (en la pestaña Productos) para poder armar recetas.</p>
      </section>
    );
  }

  return (
    <section className="caja-card">
      <h3 className="caja-card__title">Receta por platillo</h3>
      <label className="caja-field" style={{ maxWidth: 420 }}>
        <span>Platillo</span>
        <select value={prodId} onChange={(e) => setProdId(e.target.value)}>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </label>

      {receta.length === 0 ? (
        <p className="caja-muted" style={{ marginTop: "1rem" }}>Este platillo aún no tiene receta. Agrega insumos abajo.</p>
      ) : (
        <table className="caja-table" style={{ marginTop: "1rem" }}>
          <thead>
            <tr><th>Insumo</th><th className="num">Cantidad</th><th className="num">Costo</th><th></th></tr>
          </thead>
          <tbody>
            {receta.map((r) => {
              const ins = insumoDe.get(r.insumo_id);
              return (
                <tr key={r.insumo_id}>
                  <td>{ins?.nombre ?? "—"}</td>
                  <td className="num">{r.cantidad} {ins?.unidad}</td>
                  <td className="num">{mxnCorto(r.cantidad * (ins?.costo_unitario ?? 0))}</td>
                  <td className="num">
                    <button className="caja-iconbtn" title="Quitar" onClick={() => set(r.insumo_id, 0)}>✕</button>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td><strong>Costo del platillo</strong></td>
              <td></td>
              <td className="num"><strong>{mxn(costo)}</strong></td>
              <td></td>
            </tr>
            {producto && (
              <tr>
                <td>Precio de venta · margen</td>
                <td></td>
                <td className={`num ${producto.precio - costo < 0 ? "neg" : "pos"}`}>
                  {mxnCorto(producto.precio)} · {mxnCorto(producto.precio - costo)}
                </td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {insumos.length === 0 ? (
        <p className="caja-muted caja-ajustes__add">Agrega insumos arriba para poder usarlos en recetas.</p>
      ) : (
        <form className="caja-form caja-form--grid caja-ajustes__add" onSubmit={agregar}>
          <label className="caja-field">
            <span>Insumo</span>
            <select value={insId} onChange={(e) => setInsId(e.target.value)}>
              {insumos.map((i) => (
                <option key={i.id} value={i.id}>{i.nombre} ({i.unidad})</option>
              ))}
            </select>
          </label>
          <label className="caja-field">
            <span>Cantidad que usa</span>
            <input type="number" min="0" step="0.001" value={cant} onChange={(e) => setCant(e.target.value)} placeholder="por platillo" />
          </label>
          <div className="caja-form__full">
            <button className="caja-btn caja-btn--primary">Agregar a la receta</button>
          </div>
        </form>
      )}
    </section>
  );
}
