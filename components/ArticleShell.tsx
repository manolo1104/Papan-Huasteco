import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { type BlogPost, otherPosts } from "@/lib/blog";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/schema";
import JsonLd from "./JsonLd";
import { WhatsAppIcon } from "./Icons";

export default function ArticleShell({
  post,
  ctaTitle,
  ctaText,
  children,
}: {
  post: BlogPost;
  ctaTitle: string;
  ctaText: string;
  children: React.ReactNode;
}) {
  const more = otherPosts(post.slug);
  const breadcrumb = breadcrumbSchema([
    { name: "Inicio", url: SITE.url },
    { name: "Blog", url: `${SITE.url}/blog` },
    { name: post.cardTitle, url: `${SITE.url}/blog/${post.slug}` },
  ]);
  return (
    <div className="subpage">
      <JsonLd data={{ "@context": "https://schema.org", ...blogPostingSchema(post) }} />
      <JsonLd data={{ "@context": "https://schema.org", ...breadcrumb }} />
      <header className="article-hero">
        <span className="cat">{post.category}</span>
        <h1>{post.title}</h1>
        <p className="article-meta">{post.meta}</p>
      </header>

      <div className="article-cover">
        <div className="article-cover-inner">
          <Image src={post.cover} alt={post.coverAlt} fill sizes="(max-width: 1000px) 100vw, 1000px" priority />
        </div>
      </div>

      <article className="article-body">{children}</article>

      <div className="article-cta">
        <h3>{ctaTitle}</h3>
        <p>{ctaText}</p>
        <div className="btns">
          <Link className="btn btn--tierra" href="/#reservar">
            Reservar mesa
          </Link>
          <a className="btn btn--ghost" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon style={{ width: "1em", height: "1em", verticalAlign: "-0.14em" }} /> WhatsApp
          </a>
        </div>
      </div>

      <section className="more-posts">
        <h2>Sigue leyendo</h2>
        <div className="blog-grid" style={{ marginTop: 0, padding: 0 }}>
          {more.map((p) => (
            <Link className="post-card" href={`/blog/${p.slug}`} key={p.slug}>
              <div className="post-card-img">
                <Image src={p.cover} alt={p.coverAlt} fill sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="post-card-body">
                <span className="post-card-cat">{p.category}</span>
                <h3>{p.cardTitle}</h3>
                <span className="read">Leer artículo →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
