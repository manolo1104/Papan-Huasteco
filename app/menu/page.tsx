import type { Metadata } from "next";
import Link from "next/link";
import { MENU } from "@/lib/menu";
import { SITE } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { Icon } from "@/components/Icons";
import { menuSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Menú y precios · Cocina huasteca en Xilitla",
  description:
    "Menú completo de El Papán Huasteco en Xilitla: desayunos, enchiladas huastecas, bocoles, arrachera, mariscos, antojitos del comal y café de olla. Precios en pesos. Abierto todos los días.",
  alternates: { canonical: "/menu" },
  openGraph: {
    type: "website",
    title: "Menú de El Papán Huasteco · Cocina Huasteca en Xilitla",
    description:
      "Carta completa de cocina huasteca potosina: desayunos, del comal, principales, del mar, antojitos y bebidas. A 5 minutos de Las Pozas.",
    images: ["/images/dishes/enchiladas.jpg"],
  },
};

export default function MenuPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Inicio", url: SITE.url },
    { name: "Menú", url: `${SITE.url}/menu` },
  ]);
  return (
    <div className="subpage">
      <JsonLd data={{ "@context": "https://schema.org", ...menuSchema() }} />
      <JsonLd data={{ "@context": "https://schema.org", ...breadcrumb }} />

      <header className="menupage-hero">
        <p className="article-meta">El Papán Huasteco · Xilitla, SLP</p>
        <h1>Menú y precios</h1>
        <p>
          Cocina huasteca potosina preparada al momento, a 5 minutos del Castillo de Edward James (Las Pozas).
          Desayunos desde $45, platillos principales de $150 a $350. Precios en pesos mexicanos; aceptamos efectivo y
          tarjeta.
        </p>
        <div className="menupage-cta">
          <Link href="/#reservar" className="btn btn--tierra">
            Reservar mesa
          </Link>
          <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn--outline" data-evt="menu_whatsapp">
            Pedir por WhatsApp
          </a>
        </div>
      </header>

      <div className="menupage-body">
        {MENU.map((cat) => (
          <section className="menupage-cat" key={cat.id}>
            <h2 className="heading-md">{cat.label}</h2>
            {cat.featured && (
              <div className="menu-featured">
                <div className="menu-feat-left">
                  <div className="menu-feat-badge">
                    <Icon name={cat.featured.icon} /> {cat.featured.badge}
                  </div>
                  <div className="menu-feat-name">{cat.featured.name}</div>
                  <div className="menu-feat-desc">{cat.featured.desc}</div>
                </div>
                <div className="menu-feat-price">{cat.featured.price}</div>
              </div>
            )}
            <div className="menu-two-col">
              {[cat.items.slice(0, Math.ceil(cat.items.length / 2)), cat.items.slice(Math.ceil(cat.items.length / 2))].map(
                (col, ci) => (
                  <div key={ci}>
                    {col.map((item) => (
                      <div className="menu-row" key={item.name}>
                        <div className="menu-row-left">
                          <div className="menu-row-name">{item.name}</div>
                          {item.desc && <div className="menu-row-desc">{item.desc}</div>}
                        </div>
                        <div className="menu-row-price">{item.price}</div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </section>
        ))}

        <p className="menu-note" style={{ textAlign: "center", marginTop: "2.5rem" }}>
          Precios en pesos mexicanos · Sujeto a disponibilidad · Todo preparado al momento
        </p>
        <div className="menupage-cta" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
          <Link href="/#reservar" className="btn btn--filled">
            Reservar mesa →
          </Link>
          <Link href="/las-pozas" className="btn btn--outline">
            Estamos junto a Las Pozas
          </Link>
        </div>
      </div>
    </div>
  );
}
