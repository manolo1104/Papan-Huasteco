import { SITE } from "@/lib/site";

export default function WhatsAppFloat() {
  return (
    <a
      className="wfloat"
      href={SITE.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      data-evt="whatsapp_float"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 5h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9.5L5 18.5V15a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      </svg>
    </a>
  );
}
