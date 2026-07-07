import { BITACORA_ACCIONES, labelDe, type Bitacora } from "@/lib/caja/types";
import { mxnCorto } from "@/lib/caja/format";

// Bitácora de movimientos: quién hizo qué y desde qué cuenta (rol).
// Server component: los filtros van por query string (?fecha=&accion=).

const ROL_LABEL: Record<string, string> = {
  admin: "Dueño",
  operador: "Encargada",
  mesero: "Mesero",
  cocina: "Cocina",
};

function fechaHora(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BitacoraPanel({
  movimientos,
  fecha,
  accion,
}: {
  movimientos: Bitacora[];
  fecha: string;
  accion: string;
}) {
  return (
    <div className="caja-page">
      <header className="caja-head">
        <h1>Bitácora de movimientos</h1>
        <p className="caja-head__sub">
          Cobros, cancelaciones, cortes y gastos: qué pasó, quién lo hizo y desde
          qué cuenta. Los registros no se pueden editar ni borrar.
        </p>
      </header>

      <form className="caja-rango caja-noprint" method="get">
        <label className="caja-field">
          <span>Día</span>
          <input type="date" name="fecha" defaultValue={fecha} />
        </label>
        <label className="caja-field">
          <span>Acción</span>
          <select name="accion" defaultValue={accion}>
            <option value="">Todas</option>
            {BITACORA_ACCIONES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        <button className="caja-btn caja-btn--primary caja-btn--sm">Ver</button>
      </form>

      <section className="caja-card">
        {movimientos.length === 0 ? (
          <p className="caja-muted">
            Sin movimientos con esos filtros. (La bitácora empieza a registrarse a
            partir de la fase 5.)
          </p>
        ) : (
          <div className="caja-table-wrap">
            <table className="caja-table">
              <thead>
                <tr>
                  <th>Cuándo</th>
                  <th>Quién</th>
                  <th>Acción</th>
                  <th>Detalle</th>
                  <th className="num">Monto</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m) => (
                  <tr key={m.id}>
                    <td style={{ whiteSpace: "nowrap" }}>{fechaHora(m.created_at)}</td>
                    <td>{ROL_LABEL[m.rol] ?? m.rol}</td>
                    <td>{labelDe([...BITACORA_ACCIONES], m.accion)}</td>
                    <td>{m.detalle ?? "—"}</td>
                    <td className="num">{m.monto != null ? mxnCorto(m.monto) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
