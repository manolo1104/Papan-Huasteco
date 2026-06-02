"use client";

import { useEffect } from "react";

// Observa los elementos animables y les agrega la clase `visible` al entrar
// en pantalla (mismo efecto que el sitio original, con IntersectionObserver).
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
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
