"use client";

import { useEffect } from "react";

// Anima los elementos al entrar en pantalla (IntersectionObserver) y, como red
// de seguridad, revela los que quedaron POR ENCIMA del viewport (carga desplazada
// o saltos por ancla del menú) para que no queden ocultos ocupando espacio.
// No revela los que están por debajo del fold: esos deben animarse al hacer scroll.
const SELECTOR = [
  ".reveal",
  ".reveal-clip",
  ".intro-visual",
  ".laspozas-perks",
  ".amenities-grid",
  ".review-card",
  ".faq-list",
  ".cta-content",
  ".reservar-form-wrap",
].join(", ");

export default function RevealObserver() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    if (!els.length) return;

    const reveal = (el: Element) => el.classList.add("visible");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(reveal);
      return;
    }

    // Animación normal: revela cuando el elemento entra en pantalla desde abajo.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));

    // Red de seguridad: revela SOLO lo que quedó por encima del viewport
    // (scrolleado/saltado con ancla). No toca lo de abajo, que sí debe animarse.
    let ticking = false;
    const revealPassed = () => {
      for (const el of els) {
        if (el.classList.contains("visible")) continue;
        if (el.getBoundingClientRect().bottom <= 0) {
          reveal(el);
          io.unobserve(el);
        }
      }
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(revealPassed);
    };
    revealPassed();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", onScroll);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("hashchange", onScroll);
    };
  }, []);

  return null;
}
