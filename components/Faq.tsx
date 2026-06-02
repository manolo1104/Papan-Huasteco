"use client";

import { useState } from "react";
import { FAQS } from "@/lib/faq";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button className="faq-q" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {q}
      </button>
      <div className="faq-a-wrap">
        <div className="faq-a">
          <p>{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  return (
    <section id="faq" className="faq" aria-labelledby="faq-h2">
      <div className="faq-inner">
        <div className="faq-head reveal">
          <h2 className="heading-md" id="faq-h2">
            Antes de tu visita
          </h2>
        </div>
        <div className="faq-list reveal">
          {FAQS.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
