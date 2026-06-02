export default function ExperienciaBreak() {
  return (
    <div className="experiencia-break" aria-label="Experiencia en la selva huasteca">
      <div
        className="experiencia-bg"
        role="img"
        aria-label="Vista de la exuberante selva tropical de la Huasteca Potosina en Xilitla, San Luis Potosí"
      />
      <div className="experiencia-content reveal">
        <h2 className="heading-lg" style={{ marginBottom: "1rem" }}>
          Comer en medio
          <br />
          de la selva
        </h2>
        <p className="body-text" style={{ maxWidth: 420 }}>
          Nuestra terraza al aire libre está rodeada de árboles y naturaleza tropical. Desayunas, comes o cenas mientras
          escuchas los pájaros de la selva huasteca. Una experiencia que alimenta la panza y el alma.
        </p>
        <a href="#galeria" className="btn btn--outline-light" aria-label="Ver la galería del restaurante">
          Ver Galería →
        </a>
      </div>
    </div>
  );
}
