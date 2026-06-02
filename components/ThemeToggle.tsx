"use client";

import { useEffect, useState } from "react";

// Botón claro/oscuro. Persiste la preferencia en localStorage.
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = !dark;
    const root = document.documentElement;
    const apply = () => {
      if (next) root.setAttribute("data-theme", "dark");
      else root.removeAttribute("data-theme");
    };

    const btn = e.currentTarget;
    btn.classList.remove("spin");
    void btn.offsetWidth;
    btn.classList.add("spin");

    try {
      localStorage.setItem("papan-theme", next ? "dark" : "light");
    } catch {}

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Cortina circular desde el botón (View Transitions API). Fallback: cambio directo.
    if (!reduce && typeof document.startViewTransition === "function") {
      const rect = btn.getBoundingClientRect();
      root.style.setProperty("--vt-x", `${rect.left + rect.width / 2}px`);
      root.style.setProperty("--vt-y", `${rect.top + rect.height / 2}px`);
      document.startViewTransition(() => {
        apply();
        setDark(next);
      });
    } else {
      apply();
      setDark(next);
    }
  };

  return (
    <button className="theme-toggle" type="button" onClick={toggle} aria-label="Cambiar modo claro/oscuro">
      {dark ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" />
        </svg>
      )}
    </button>
  );
}
