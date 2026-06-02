"use client";

import { useEffect } from "react";

// Observa los elementos animables y les agrega la clase `visible` al entrar en
// pantalla. A prueba de fallos: revela lo que ya está en/por encima del viewport
// (carga desplazada o saltos por ancla del menú) y tiene una red de seguridad,
// para que NINGÚN elemento quede oculto ocupando espacio.
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

    // Revela de inmediato lo que ya esté en pantalla o por encima de ella
    // (cubre cargas desplazadas y saltos por ancla del nav).
    const revealInOrAbove = () => {
      const vh = window.innerHeight;
      for (const el of els) {
        if (el.classList.contains("visible")) continue;
        if (el.getBoundingClientRect().top < vh * 0.92) reveal(el);
      }
    };

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

    // Pase inicial + al hacer scroll/resize (rAF), para no dejar nada oculto
    // que ya se haya "pasado" (elementos por encima del viewport).
    revealInOrAbove();
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        revealInOrAbove();
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Red de seguridad: si algo quedó oculto, revélalo.
    const safety = window.setTimeout(() => els.forEach(reveal), 1500);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(safety);
    };
  }, []);

  return null;
}
