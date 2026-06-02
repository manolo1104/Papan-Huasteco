import Image from "next/image";
import { Icon } from "./Icons";

const FEATURE = {
  img: "/images/dishes/huevos-ahogados.jpg",
  imgAlt: "Huevos servidos sobre chilaquiles con cecina, un desayuno huasteco de El Papán Huasteco en Xilitla",
  name: "Huevos Ahogados",
  desc: "En salsa ranchera con rajas poblanas, queso y aguacate, servidos en cazuela de barro. Acompañados de frijoles de olla y tortillas recién hechas al comal.",
  price: "$150",
};

const SIDES = [
  {
    img: "/images/dishes/arrachera.jpg",
    imgAlt: "Arrachera asada en rebanadas con papas al fogón servida en El Papán Huasteco, Xilitla",
    category: "Favorito",
    name: "Arrachera 300 g",
    desc: "Con guacamole, nopal gratinado, chile toreado y quesadillas.",
    price: "$350",
  },
  {
    img: "/images/dishes/antojitos.jpg",
    imgAlt: "Guacamole con totopos y antojitos huastecos en El Papán Huasteco, Xilitla",
    category: "Del Comal",
    name: "Bocoles y Antojitos",
    desc: "Masa de maíz al comal rellena de frijol, queso o cecina, con salsa de la casa.",
    price: "desde $60",
  },
];

export default function Platillos() {
  return (
    <section id="platillos" className="platos" aria-labelledby="platos-h2">
      <div className="platos-header reveal">
        <h2 className="heading-lg" id="platos-h2">
          Sabores de la Huasteca Potosina
        </h2>
        <p className="body-text">
          Desde los desayunos más tradicionales hasta los cortes y mariscos del día, todo preparado al momento con
          ingredientes frescos de la región.
        </p>
      </div>

      <div className="platos-edit">
        <a href="#menu-section" className="plato-feature spotlight reveal reveal-left" aria-label="Ver Huevos Ahogados en el menú">
          <div className="pf-img tilt">
            <Image src={FEATURE.img} alt={FEATURE.imgAlt} fill sizes="(max-width: 860px) 100vw, 55vw" style={{ objectFit: "cover" }} />
          </div>
          <div className="pf-body">
            <p className="plato-category plato-category--star">
              <Icon name="star" /> El Más Pedido
            </p>
            <h3 className="plato-name">{FEATURE.name}</h3>
            <p className="plato-desc">{FEATURE.desc}</p>
            <span className="plato-price">{FEATURE.price}</span>
          </div>
        </a>

        <div className="plato-side">
          {SIDES.map((d, i) => (
            <a
              href="#menu-section"
              className={`plato-mini spotlight reveal reveal-right reveal-delay-${i + 1}`}
              key={d.name}
              aria-label={`Ver ${d.name} en el menú`}
            >
              <div className="pm-img">
                <Image src={d.img} alt={d.imgAlt} fill sizes="(max-width: 860px) 100vw, 18vw" style={{ objectFit: "cover" }} />
              </div>
              <div className="pm-body">
                <p className="plato-category">{d.category}</p>
                <h3 className="plato-name">{d.name}</h3>
                <p className="plato-desc">{d.desc}</p>
                <span className="plato-price">{d.price}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
