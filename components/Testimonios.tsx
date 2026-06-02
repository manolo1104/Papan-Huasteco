import { SITE } from "@/lib/site";
import CountUp from "./CountUp";

const FEATURED = {
  text: "El mejor restaurante de la región. La atención es increíble, el sabor excepcional. Podría desayunar, comer y cenar en el mismo lugar, y de paso alimentar la vista con la naturaleza.",
  name: "Carlos A.",
  initial: "C",
  source: "Google Maps",
};

const SIDE = [
  {
    text: "This is a hidden gem of Xilitla. All the food was delicious, prices reasonable and the atmosphere is amazing. The service was top notch!",
    name: "Visitante",
    initial: "V",
    source: "Google Maps",
  },
  {
    text: "The best restaurant of our holiday. Great food, a terrace surrounded by the jungle. Comida 100% casera y un espacio relajante.",
    name: "Bambú Center",
    initial: "B",
    source: "Restaurant Guru",
  },
];

const PLATFORMS = [
  { num: SITE.rating.value, label: "Google Maps", href: SITE.mapsLink },
  { num: "5.0", label: "TripAdvisor", href: SITE.social.tripadvisor },
  { num: "4.8", label: "Restaurant Guru", href: SITE.mapsLink },
  { num: "#1", label: "Mejor en Xilitla", href: SITE.mapsLink },
];

export default function Testimonios() {
  return (
    <section id="testimonios" className="testimonios" aria-labelledby="test-h2">
      <div className="testimonios-header reveal">
        <h2 className="heading-lg" id="test-h2">
          Lo que dicen nuestros visitantes
        </h2>
        <span className="deco-line deco-line--center" aria-hidden="true" />
      </div>

      <div className="reviews-edit">
        <article className="review-feature spotlight reveal reveal-left">
          <span className="rf-mark" aria-hidden="true">
            &ldquo;
          </span>
          <div className="review-stars" aria-label="5 de 5 estrellas">
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </div>
          <p className="review-text">{FEATURED.text}</p>
          <div className="review-author">
            <div className="review-avatar" aria-hidden="true">
              {FEATURED.initial}
            </div>
            <div>
              <div className="review-name">{FEATURED.name}</div>
              <div className="review-source">{FEATURED.source}</div>
            </div>
          </div>
        </article>

        <div className="review-side">
          {SIDE.map((r, i) => (
            <article className={`review-sm spotlight reveal reveal-right reveal-delay-${i + 1}`} key={r.name}>
              <div className="review-stars" aria-label="5 de 5 estrellas">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <p className="review-text">{r.text}</p>
              <div className="review-author">
                <div className="review-avatar" aria-hidden="true">
                  {r.initial}
                </div>
                <div>
                  <div className="review-name">{r.name}</div>
                  <div className="review-source">{r.source}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="rating-summary reveal">
        {PLATFORMS.map((p) => {
          const isRank = p.num.startsWith("#");
          return (
            <a className="rating-item" key={p.label} href={p.href} target="_blank" rel="noopener noreferrer">
              <span className="rating-num">
                <CountUp
                  value={isRank ? parseInt(p.num.slice(1), 10) : parseFloat(p.num)}
                  decimals={isRank ? 0 : 1}
                  prefix={isRank ? "#" : ""}
                />
              </span>
              <span className="rating-platform">{p.label}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
