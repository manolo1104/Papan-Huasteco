import Hero from "@/components/Hero";
import Strip from "@/components/Strip";
import Intro from "@/components/Intro";
import Platillos from "@/components/Platillos";
import ExperienciaBreak from "@/components/ExperienciaBreak";
import Reconocimiento from "@/components/Reconocimiento";
import Marquee from "@/components/Marquee";
import Menu from "@/components/Menu";
import LasPozas from "@/components/LasPozas";
import Galeria from "@/components/Galeria";
import Testimonios from "@/components/Testimonios";
import Reservar from "@/components/Reservar";
import Info from "@/components/Info";
import Faq from "@/components/Faq";
import CtaFinal from "@/components/CtaFinal";
import JsonLd from "@/components/JsonLd";
import { faqPageSchema, menuSchema } from "@/lib/schema";

export default function Home() {
  return (
    <main>
      <JsonLd data={faqPageSchema()} />
      <JsonLd data={menuSchema()} />
      <Hero />
      <Strip />
      <Intro />
      <Platillos />
      <ExperienciaBreak />
      <Reconocimiento />
      <Marquee />
      <Menu />
      <LasPozas />
      <Galeria />
      <Testimonios />
      <Reservar />
      <Info />
      <Faq />
      <CtaFinal />
    </main>
  );
}
