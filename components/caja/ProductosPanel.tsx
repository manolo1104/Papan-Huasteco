"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Rol } from "@/lib/caja/auth";
import type { ProductoCosteo } from "@/lib/caja/types";
import { mxn, mxnCorto } from "@/lib/caja/format";
import { useFeedback } from "@/components/caja/ui/Feedback";
import { Icon } from "@/components/caja/ui/Icon";

export default function ProductosPanel({
  rol,
  productos,
}: {
  rol: Rol;
  productos: ProductoCosteo[];
}) {
  const router = useRouter();
  const { toast, confirm, prompt } = useFeedback();
  const [busy, setBusy] = useState(false);
  const [busca, setBusca] = useState("");

  const categorias = useMemo(
    () => Array.from(new Set(productos.map((p) => p.categoria))),
    [productos]
  );

  const visibles = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return q ? productos.filter((p) => p.nombre.toLowerCase().includes(q)) : productos;
  }, [productos, busca]);

  async function importar() {
    const ok = await confirm({
      title: "Importar menú del sitio",
      message: "Carga o actualiza los platillos desde la carta de tu sitio web. No pisa los precios que ya cambiaste.",
      confirmLabel: "Importar",
    });
    if (!ok) return;
    setBusy(true);
    const res = await fetch("/api/admin/pos/productos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "importar" }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast.error(data.error || "No se pudo importar.");
    toast.success(`${data.nuevos ?? 0} platillos nuevos · ${data.total} en total`);
    router.refresh();
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(true);
    const res = await fetch("/api/admin/pos/productos", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || "No se pudo guardar.");
    }
  }

  async function editarPrecio(p: ProductoCosteo) {
    const v = await prompt({
      title: `Precio de ${p.nombre}`,
      label: "Nuevo precio (MXN)",
      type: "number",
      defaultValue: String(p.precio),
    });
    if (v == null) return;
    const precio = Number(v);
    if (!Number.isFinite(precio) || precio < 0) return toast.error("Precio no válido.");
    patch(p.id, { precio });
  }

  const totalProd = productos.length;
  const porCategoria = useMemo(() => {
    const m = new Map<string, ProductoCosteo[]>();
    for (const p of visibles) {
      if (!m.has(p.categoria)) m.set(p.categoria, []);
      m.get(p.categoria)!.push(p);
    }
    return Array.from(m.entries());
  }, [visibles]);

  return (
    <div className="caja-page">
      <header className="caja-head caja-head--row">
        <div>
          <h1>Productos (la carta)</h1>
          <p className="caja-head__sub">{totalProd} platillos en el sistema. El costo y margen salen de las recetas (Inventario).</p>
        </div>
        <button className="caja-btn caja-btn--primary caja-btn--sm" disabled={busy} onClick={importar}>
          <Icon name="importar" size={15} /> Importar menú del sitio
        </button>
      </header>


      {totalProd === 0 ? (
        <div className="caja-empty">
          <h2>Aún no hay productos</h2>
          <p>Pulsa <strong>“Importar menú del sitio”</strong> para cargar de un jalón todos los platillos de tu carta con sus precios.</p>
        </div>
      ) : (
        <>
          <input className="caja-pos__buscar" placeholder="Buscar platillo…" value={busca} onChange={(e) => setBusca(e.target.value)} />
          {porCategoria.map(([categoria, lista]) => (
            <section className="caja-card" key={categoria}>
              <h3 className="caja-card__title">{categoria}</h3>
              <div className="caja-table-wrap">
                <table className="caja-table">
                  <thead>
                    <tr>
                      <th>Platillo</th>
                      <th className="num">Precio</th>
                      <th className="num">Costo</th>
                      <th className="num">Margen</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((p) => (
                      <tr key={p.id} style={{ opacity: p.disponible ? 1 : 0.5 }}>
                        <td>{p.nombre}</td>
                        <td className="num">{mxnCorto(p.precio)}</td>
                        <td className="num">{p.tieneReceta ? mxnCorto(p.costo) : "—"}</td>
                        <td className={`num ${p.tieneReceta && p.margen < 0 ? "neg" : p.tieneReceta ? "pos" : ""}`}>
                          {p.tieneReceta ? mxnCorto(p.margen) : "—"}
                        </td>
                        <td>{p.disponible ? "Disponible" : "Agotado"}</td>
                        <td className="num caja-prod-acc">
                          <button className="caja-btn caja-btn--sm caja-btn--ghost" disabled={busy} onClick={() => editarPrecio(p)}>Precio</button>
                          <button className="caja-btn caja-btn--sm caja-btn--ghost" disabled={busy} onClick={() => patch(p.id, { disponible: !p.disponible })}>
                            {p.disponible ? "Agotar" : "Activar"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
