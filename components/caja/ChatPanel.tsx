"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/caja/ui/Icon";

type Msg = { role: "user" | "assistant"; content: string };

const SUGERENCIAS = [
  "¿Cómo voy de ventas este mes?",
  "¿Cuánto llevo de utilidad este mes?",
  "¿Qué insumos tengo que surtir?",
  "¿Cuál es mi platillo más vendido?",
  "¿Tengo eventos con saldo pendiente?",
  "¿En qué estoy gastando más?",
];

export default function ChatPanel() {
  const [mensajes, setMensajes] = useState<Msg[]>([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando]);

  async function enviar(pregunta: string) {
    const q = pregunta.trim();
    if (!q || cargando) return;
    const historial: Msg[] = [...mensajes, { role: "user", content: q }];
    setMensajes(historial);
    setTexto("");
    setCargando(true);
    try {
      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: historial }),
      });
      const data = await res.json().catch(() => ({}));
      const respuesta = data.reply || data.error || "No pude responder ahora. Intenta de nuevo.";
      setMensajes((m) => [...m, { role: "assistant", content: respuesta }]);
    } catch {
      setMensajes((m) => [
        ...m,
        { role: "assistant", content: "No hay conexión en este momento. Intenta de nuevo." },
      ]);
    } finally {
      setCargando(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    enviar(texto);
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar(texto);
    }
  }

  return (
    <div className="caja-page caja-chat">
      <header className="caja-head">
        <h1><Icon name="asistente" size={22} /> Asistente</h1>
        <p className="caja-head__sub">
          Pregúntale lo que sea de tu negocio. Ve en vivo tus ventas, gastos,
          inventario y eventos.
        </p>
      </header>

      <div className="caja-chat__hilo">
        {mensajes.length === 0 && !cargando && (
          <div className="caja-chat__intro">
            <p className="caja-muted">Toca una pregunta para empezar, o escribe la tuya.</p>
            <div className="caja-chat__sugs">
              {SUGERENCIAS.map((s) => (
                <button key={s} className="caja-chat__sug" onClick={() => enviar(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensajes.map((m, i) => (
          <div key={i} className={`caja-burbuja caja-burbuja--${m.role}`}>
            {m.content}
          </div>
        ))}

        {cargando && (
          <div className="caja-burbuja caja-burbuja--assistant caja-burbuja--pensando">
            <span className="caja-typing"><i /><i /><i /></span> Pensando…
          </div>
        )}
        <div ref={finRef} />
      </div>

      <form className="caja-chat__barra" onSubmit={onSubmit}>
        <textarea
          className="caja-chat__input"
          rows={1}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={onKey}
          placeholder="Escribe tu pregunta…"
          disabled={cargando}
        />
        <button className="caja-btn caja-btn--primary caja-chat__enviar" disabled={cargando || !texto.trim()}>
          <Icon name="enviar" size={18} />
        </button>
      </form>
    </div>
  );
}
