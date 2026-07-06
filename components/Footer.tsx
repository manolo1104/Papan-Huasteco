import { SITE } from "@/lib/site";
import { InstagramIcon, FacebookIcon } from "./Icons";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-copy">
          © {new Date().getFullYear()} El Papán Huasteco · Hotel Paraíso Encantado
          <br />
          {SITE.address.full} · {SITE.phoneDisplay}
        </div>
        <ul className="footer-links-row">
          <li>
            <a href="/#nosotros">Nosotros</a>
          </li>
          <li>
            <a href="/#reservar">Reservar</a>
          </li>
          <li>
            <a href="/menu">Menú</a>
          </li>
          <li>
            <a href="/las-pozas">Las Pozas</a>
          </li>
          <li>
            <a href="/blog">Blog</a>
          </li>
          <li>
            <a href="/#info">Contacto</a>
          </li>
          <li>
            <a href="/menu">Menú y precios</a>
          </li>
          <li>
            <a href="/privacidad">Aviso de Privacidad</a>
          </li>
        </ul>
      </div>
      <div className="footer-social">
        <a className="social-link" href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <InstagramIcon />
        </a>
        <a className="social-link" href={SITE.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <FacebookIcon />
        </a>
        <a className="social-link" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
            <path d="M5 5h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9.5L5 18.5V15a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
