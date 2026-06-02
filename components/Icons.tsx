// Set de íconos SVG a medida (line-art), portados del sitio original.
import type { SVGProps } from "react";

const paths: Record<string, React.ReactNode> = {
  leaf: (
    <>
      <path d="M4 20c0-8 6-14.5 16-15-1 10.5-7 16-16 15Z" />
      <path d="M5 19c4-5 8-8 12-9" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21c4.5-5 6.5-8.5 6.5-12a6.5 6.5 0 1 0-13 0c0 3.5 2 7 6.5 12Z" />
      <circle cx="12" cy="9" r="2.4" />
    </>
  ),
  car: (
    <>
      <path d="M4 15v-2.5l2-5.5h12l2 5.5V15" />
      <path d="M4 12.5h16" />
      <circle cx="8" cy="15.5" r="1.6" />
      <circle cx="16" cy="15.5" r="1.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.2 2" />
    </>
  ),
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8-4.3-4.1 5.9-.9Z" />,
  award: (
    <>
      <path d="M7 4h10v3.5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10M17 5h3v1.5A3.5 3.5 0 0 1 16.5 10" />
      <path d="M12 12.5v3" />
      <path d="M9.5 19h5l-.6-3.5h-3.8Z" />
    </>
  ),
  grain: (
    <>
      <path d="M12 21V8.5" />
      <path d="M12 9c0-2.2 1.6-3.8 3.8-3.8C15.8 7.4 14.2 9 12 9Z" />
      <path d="M12 9c0-2.2-1.6-3.8-3.8-3.8C8.2 7.4 9.8 9 12 9Z" />
      <path d="M12 14c0-2.2 1.6-3.8 3.8-3.8C15.8 12.4 14.2 14 12 14Z" />
      <path d="M12 14c0-2.2-1.6-3.8-3.8-3.8C8.2 12.4 9.8 14 12 14Z" />
    </>
  ),
  flame: <path d="M12 3c3.2 4 5 6.2 5 9.2a5 5 0 0 1-10 0c0-1.5.6-2.8 1.6-3.9C9 10 10 11 10 12c0-3 1-5.2 2-9Z" />,
  fish: (
    <>
      <path d="M3 12c3-4.2 7-5.2 11-4.2 2.2.6 4.2 2.2 6 4.2-1.8 2-3.8 3.6-6 4.2-4 1-8 0-11-4.2Z" />
      <path d="M14 8.2 18.5 5v14L14 15.8" />
      <circle cx="7.5" cy="11" r=".7" className="ic-fill" />
    </>
  ),
  chat: <path d="M5 5h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9.5L5 18.5V15a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.6 2.8 2.6 14.2 0 17M12 3.5c-2.6 2.8-2.6 14.2 0 17" />
    </>
  ),
  phone: <path d="M6 3.5h3l1.4 4-2 1.4a11 11 0 0 0 4.7 4.7l1.4-2 4 1.4v3a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 4.6 5.1 1.5 1.5 0 0 1 6 3.5Z" />,
  paw: (
    <>
      <circle cx="7" cy="10" r="1.7" />
      <circle cx="12" cy="8" r="1.8" />
      <circle cx="17" cy="10" r="1.7" />
      <path d="M12 12c-3 0-5 2-5 4.4 0 1.5 1.3 2.1 2.6 1.5l2.4-1 2.4 1c1.3.6 2.6 0 2.6-1.5C17 14 15 12 12 12Z" />
    </>
  ),
  wifi: (
    <>
      <path d="M3 8.5a14 14 0 0 1 18 0" />
      <path d="M6 12a9 9 0 0 1 12 0" />
      <path d="M9 15.5a4 4 0 0 1 6 0" />
      <circle cx="12" cy="19" r="1" className="ic-fill" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M6.5 14h4" />
    </>
  ),
  bed: (
    <>
      <path d="M3 18V8" />
      <path d="M3 13h16a2 2 0 0 1 2 2v3" />
      <path d="M3 13v-1.5A1.5 1.5 0 0 1 4.5 10H11a2 2 0 0 1 2 2v1" />
      <path d="M21 18v-3" />
    </>
  ),
};

export function Icon({ name, className = "ic", ...rest }: { name: keyof typeof paths | string } & SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...rest}>
      {paths[name] ?? null}
    </svg>
  );
}

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 5h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9.5L5 18.5V15a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M14 8.5h2.5M14 8.5c0-2 1-3 3-3M14 8.5V21M11 12.5h6" />
      <path d="M14 21V12.5" />
    </svg>
  );
}
