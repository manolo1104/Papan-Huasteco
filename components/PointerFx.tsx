"use client";

import { useEffect } from "react";

// Efectos de cursor (solo escritorio): reflector que sigue el cursor en .spotlight
// e inclinación 3D sutil en .tilt. Respeta reduced-motion para el tilt.
export default function PointerFx() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onMove = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(".spotlight");
      if (el) {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    };
    document.addEventListener("mousemove", onMove);

    const cleanups: (() => void)[] = [];
    if (!reduce) {
      document.querySelectorAll<HTMLElement>(".tilt").forEach((el) => {
        const move = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          el.style.transform = `perspective(800px) rotateX(${((0.5 - py) * 5).toFixed(2)}deg) rotateY(${((px - 0.5) * 5).toFixed(2)}deg)`;
        };
        const leave = () => {
          el.style.transform = "";
        };
        el.addEventListener("mousemove", move);
        el.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          el.removeEventListener("mousemove", move);
          el.removeEventListener("mouseleave", leave);
        });
      });
    }

    return () => {
      document.removeEventListener("mousemove", onMove);
      cleanups.forEach((c) => c());
    };
  }, []);

  return null;
}
