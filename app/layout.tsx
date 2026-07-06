import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import NavGate from "@/components/NavGate";
import SiteFootGate from "@/components/SiteFootGate";
import ScrollProgress from "@/components/ScrollProgress";
import RevealObserver from "@/components/RevealObserver";
import Analytics from "@/components/Analytics";
import Parallax from "@/components/Parallax";
import PointerFx from "@/components/PointerFx";
import JsonLd from "@/components/JsonLd";
import { siteGraph } from "@/lib/schema";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dmsans",
  display: "swap",
});
const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-baskerville",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "El Papán Huasteco · Restaurante en Xilitla · Cocina Huasteca Auténtica",
    template: "%s · El Papán Huasteco",
  },
  description:
    "Restaurante de cocina huasteca auténtica en Xilitla, SLP. A minutos del Castillo de Edward James. Ingredientes frescos, platillos regionales tradicionales. Visítanos.",
  keywords: [
    "restaurante Xilitla",
    "comida huasteca",
    "restaurante cerca castillo Edward James Las Pozas",
    "dónde comer Xilitla",
    "El Papán Huasteco",
  ],
  authors: [{ name: "El Papán Huasteco" }],
  alternates: { canonical: "/" },
  robots: "index, follow, max-image-preview:large",
  openGraph: {
    type: "website",
    siteName: "El Papán Huasteco",
    title: "El Papán Huasteco · Cocina Huasteca Auténtica en Xilitla",
    description:
      "Restaurante de cocina huasteca auténtica en Xilitla, SLP, a minutos del Castillo de Edward James (Las Pozas). Abierto todos los días.",
    url: SITE.url,
    locale: "es_MX",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Terraza del restaurante El Papán Huasteco en Xilitla rodeada de selva huasteca",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "El Papán Huasteco · Cocina Huasteca Auténtica en Xilitla",
    description:
      "Restaurante de cocina huasteca auténtica en Xilitla, SLP, a minutos del Castillo de Edward James (Las Pozas). Abierto todos los días.",
    images: ["/images/og-image.jpg"],
  },
  icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
  other: {
    "geo.region": "MX-SLP",
    "geo.placename": "Xilitla",
    "geo.position": "21.3950344;-98.9913514",
  },
};

export const viewport = { themeColor: "#3a5c3e" };

const themeInit = `try{var t=localStorage.getItem('papan-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX" className={`${cormorant.variable} ${dmSans.variable} ${baskerville.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <JsonLd data={siteGraph()} />
      </head>
      <body>
        <div className="grain" aria-hidden="true" />
        <ScrollProgress />
        <NavGate />
        {children}
        <SiteFootGate />
        <RevealObserver />
        <Parallax />
        <PointerFx />
        <Analytics />
      </body>
    </html>
  );
}
