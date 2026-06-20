"use client";

import { useCallback, useEffect, useState } from "react";
import type { ComandaCocina } from "@/lib/caja/data";
import { useFeedback } from "@/components/caja/ui/Feedback";
import { Icon } from "@/components/caja/ui/Icon";

function minutosDesde(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
}

export default function CocinaPanel({ inicial }: { inicial: ComandaCocina[] }) {
  const { toast } = useFeedback();
  const [comandas, setComandas] = useState<ComandaCocina[]>(inicial);
  const [, setTick] = useState(0);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cocina", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setComandas(data.comandas ?? []);
    } catch {
      /* sin red: conservamos lo que había */
    }
  }, []);

  // Polling cada 5s + reloj que actualiza los minutos cada 30s.
  useEffect(() => {
    const a = setInterval(cargar, 5000);
    const b = setInterval(() => setTick((t) => t + 1), 30000);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, [cargar]);

  async function marcar(body: Record<string, unknown>, aviso?: string) {
    // Optimista: quitamos de la vista al instante para que se sienta inmediato.
    if (body.orden_id) setComandas((cs) => cs.filter((c) => c.orden_id !== body.orden_id));
    else if (body.item_id)
      setComandas((cs) =>
        cs
          .map((c) => ({ ...c, items: c.items.filter((it) => it.id !== body.item_id) }))
          .filter((c) => c.items.length > 0)
      );
    await fetch("/api/admin/cocina", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (aviso) toast.success(aviso);
    cargar();
  }

  return (
    <div className="caja-page">
      <header className="caja-head caja-head--row">
        <div>
          <h1>Cocina · Comandas</h1>
          <p className="caja-head__sub">Se actualiza sola. {comandas.length} pendiente{comandas.length === 1 ? "" : "s"}.</p>
        </div>
        <button className="caja-btn caja-btn--ghost caja-btn--sm" onClick={cargar}>
          <Icon name="actualizar" size={15} /> Actualizar
        </button>
      </header>

      {comandas.length === 0 ? (
        <div className="caja-empty">
          <h2>Todo al día 🎉</h2>
          <p>No hay comandas pendientes. Las nuevas aparecerán aquí solas.</p>
        </div>
      ) : (
        <div className="caja-comandas">
          {comandas.map((c) => {
            const mins = minutosDesde(c.creada);
            return (
              <article key={c.orden_id} className={`caja-comanda ${mins >= 15 ? "is-tarde" : ""}`}>
                <div className="caja-comanda__top">
                  <strong>{c.mesa_nombre}</strong>
                  <span className="caja-comanda__min">{mins} min</span>
                </div>
                <ul className="caja-comanda__items">
                  {c.items.map((it) => (
                    <li key={it.id}>
                      <label className="caja-comanda__item">
                        <span><strong>{it.cantidad}×</strong> {it.nombre}</span>
                        <button className="caja-btn caja-btn--sm caja-btn--ghost" onClick={() => marcar({ item_id: it.id })}>
                          Listo
                        </button>
                      </label>
                      {it.nota && <span className="caja-comanda__nota">↳ {it.nota}</span>}
                    </li>
                  ))}
                </ul>
                <button className="caja-btn caja-btn--primary" onClick={() => marcar({ orden_id: c.orden_id }, `${c.mesa_nombre} lista`)}>
                  <Icon name="check" size={16} /> Comanda completa
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
