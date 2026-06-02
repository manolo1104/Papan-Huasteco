import { SPECIALTIES } from "@/lib/menu";

export default function Marquee() {
  const loop = [...SPECIALTIES, ...SPECIALTIES];
  return (
    <div className="specialties-marquee" aria-hidden="true">
      <div className="marquee-track">
        {loop.map((s, i) => (
          <span key={i} style={{ display: "contents" }}>
            <span>{s}</span>
            <span className="sep">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
