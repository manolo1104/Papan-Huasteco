"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SITE } from "@/lib/site";
import ThemeToggle from "./ThemeToggle";
import { InstagramIcon, FacebookIcon } from "./Icons";

const LINKS = [
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/menu", label: "Menú" },
  { href: "/las-pozas", label: "Las Pozas" },
  { href: "/#galeria", label: "Galería" },
  { href: "/blog", label: "Blog" },
  { href: "/#info", label: "Contacto" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // En subpáginas (fondo claro) el nav siempre usa el estilo "scrolled" para que el texto sea visible.
  const isHome = pathname === "/";
  const solid = scrolled || !isHome;

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav className={`nav${solid ? " scrolled" : ""}`} aria-label="Navegación principal">
        <a className="nav-logo" href="/#inicio" aria-label="El Papán Huasteco, inicio">
          <Image className="nav-logo-img" src="/images/logo.png" alt="Logo El Papán Huasteco" width={120} height={48} priority />
          <span className="nav-wordmark">
            <span className="nav-name">El Papán Huasteco</span>
            <span className="nav-sub">Cocina Huasteca · Xilitla</span>
          </span>
        </a>

        <ul className="nav-links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>

        <div className="nav-cta-wrap">
          <a className="nav-tel" href={SITE.phoneTel}>
            {SITE.phoneDisplay}
          </a>
          <div className="nav-social">
            <a className="social-link" href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a className="social-link" href={SITE.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FacebookIcon />
            </a>
          </div>
          <ThemeToggle />
          <a className="btn btn--filled" href="/#reservar">
            Reservar
          </a>
          <button
            className="nav-hamburger"
            aria-label="Abrir menú"
            aria-expanded={open}
            type="button"
            onClick={() => setOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className={`nav-drawer${open ? " open" : ""}`} aria-hidden={!open}>
        <button className="nav-drawer-close" aria-label="Cerrar menú" onClick={() => setOpen(false)}>
          ✕
        </button>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <a className="btn btn--tierra" href="/#reservar" onClick={() => setOpen(false)}>
          Reservar Mesa →
        </a>
      </div>
    </>
  );
}
