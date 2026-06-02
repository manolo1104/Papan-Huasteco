import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { POSTS } from "@/lib/blog";
import JsonLd from "@/components/JsonLd";
import { blogIndexSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Blog · Cocina huasteca y guías de Xilitla",
  description:
    "Guías de viaje y gastronomía de la Huasteca Potosina: qué hacer en Xilitla, visitar Las Pozas y los platillos imperdibles de la cocina huasteca.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <div className="subpage">
      <JsonLd data={blogIndexSchema()} />
      <div className="blog-hero">
        <span className="label">Blog</span>
        <h1>Sabores y rincones de la Huasteca</h1>
        <p>Guías de viaje, gastronomía y consejos para disfrutar Xilitla y la Huasteca Potosina al máximo.</p>
      </div>

      <div className="blog-grid">
        {POSTS.map((p) => (
          <Link className="post-card" href={`/blog/${p.slug}`} key={p.slug}>
            <div className="post-card-img">
              <Image src={p.cover} alt={p.coverAlt} fill sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <div className="post-card-body">
              <span className="post-card-cat">{p.category}</span>
              <h2>{p.cardTitle}</h2>
              <p>{p.description}</p>
              <span className="read">Leer artículo →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
