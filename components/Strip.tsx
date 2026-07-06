import { Icon } from "./Icons";

const ITEMS = [
  { icon: "leaf", title: "Ingredientes 100% Frescos", text: "Preparados al momento con productos locales de la región" },
  { icon: "pin", title: "Junto al Castillo de Edward James", text: "La parada perfecta antes o después de Las Pozas" },
  { icon: "car", title: "Estacionamiento Disponible", text: "Llega sin preocupaciones, tenemos espacio para tu vehículo" },
  { icon: "clock", title: "Abierto Todos los Días", text: "De 8:00 AM a 8:00 PM · Desayuno, comida y cena" },
];

export default function Strip() {
  return (
    <div className="strip" aria-label="Características del restaurante">
      <div className="strip-inner">
        {ITEMS.map((it) => (
          <div className="strip-item reveal" key={it.title}>
            <span className="strip-icon">
              <Icon name={it.icon} />
            </span>
            <div className="strip-text">
              <strong>{it.title}</strong>
              {it.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
