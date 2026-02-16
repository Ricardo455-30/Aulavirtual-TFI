import React, { useState, useEffect } from "react";

const categorias = {
  examen: { label: "Examen", color: "#d32f2f" },
  entrega: { label: "Entrega", color: "#f57c00" },
  reunion: { label: "Reunión", color: "#388e3c" },
  personal: { label: "Personal", color: "#1976d2" },
};

const AlumnoCalendario = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventos, setEventos] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("examen");

  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem("eventosAlumno")) || [];
    setEventos(guardados);
  }, []);

  const guardarEventos = (lista) => {
    localStorage.setItem("eventosAlumno", JSON.stringify(lista));
    setEventos(lista);
  };

  const agregarEvento = () => {
    if (!texto) return;

    const nuevo = {
      fecha: fechaSeleccionada.toDateString(),
      texto,
      categoria,
    };

    guardarEventos([...eventos, nuevo]);
    setTexto("");
  };

  const generarDias = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const ultimoDia = new Date(year, month + 1, 0);

    const dias = [];
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push(new Date(year, month, i));
    }
    return dias;
  };

  const cambiarMes = (dir) => {
    const nueva = new Date(currentDate);
    nueva.setMonth(currentDate.getMonth() + dir);
    setCurrentDate(nueva);
  };

  const dias = generarDias();

  return (
    <div className="calendar-layout">

      {/* CALENDARIO PRINCIPAL */}
      <div className="calendar-main">

        <div className="calendar-header">
          <button onClick={() => cambiarMes(-1)}>◀</button>
          <h2>
            {currentDate.toLocaleString("es-AR", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button onClick={() => cambiarMes(1)}>▶</button>
        </div>

        <div className="calendar-days-names">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {dias.map((dia, i) => {
            const eventosDelDia = eventos.filter(
              (e) => e.fecha === dia.toDateString()
            );

            return (
              <div
                key={i}
                className={`calendar-day ${
                  fechaSeleccionada.toDateString() === dia.toDateString()
                    ? "selected"
                    : ""
                }`}
                onClick={() => setFechaSeleccionada(dia)}
              >
                <span>{dia.getDate()}</span>

                {eventosDelDia.map((e, idx) => (
                  <div
                    key={idx}
                    className="event-dot"
                    style={{
                      background:
                        categorias[e.categoria]?.color || "#999",
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* PANEL LATERAL */}
      <div className="calendar-side">

        <h3>
          {fechaSeleccionada.toLocaleDateString("es-AR")}
        </h3>

        <ul className="event-list">
          {eventos
            .filter((e) => e.fecha === fechaSeleccionada.toDateString())
            .map((e, i) => (
              <li key={i}>
                <span
                  className="event-tag"
                  style={{
                    background: categorias[e.categoria]?.color,
                  }}
                >
                  {categorias[e.categoria]?.label}
                </span>
                {e.texto}
              </li>
            ))}
        </ul>

        <input
          type="text"
          placeholder="Nuevo evento..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          {Object.keys(categorias).map((key) => (
            <option key={key} value={key}>
              {categorias[key].label}
            </option>
          ))}
        </select>

        <button onClick={agregarEvento}>
          Agregar Evento
        </button>
      </div>
    </div>
  );
};

export default AlumnoCalendario;
