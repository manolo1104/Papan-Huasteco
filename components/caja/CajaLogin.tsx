"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CajaLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo entrar.");
        return;
      }
      router.refresh();
    } catch {
      setError("Error de conexión. Revisa tu internet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="caja-login">
      <form className="caja-login__card" onSubmit={submit}>
        <div className="caja-login__brand">El Papán Huasteco</div>
        <h1 className="caja-login__title">Panel de Caja</h1>
        <p className="caja-login__sub">
          Control de turnos, gastos y finanzas del restaurante.
        </p>
        <label className="caja-field">
          <span>Contraseña</span>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
          />
        </label>
        {error && <p className="caja-error">{error}</p>}
        <button className="caja-btn caja-btn--primary" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
