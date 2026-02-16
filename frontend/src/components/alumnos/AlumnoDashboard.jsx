import React, { useEffect, useState } from "react";

const AlumnoDashboard = () => {

  const [materiasRecientes, setMateriasRecientes] = useState([]);
  const [recientesEventos, setRecientesEventos] = useState([]);

  useEffect(() => {

    // =========================
    // CARGAR MATERIAS RECIENTES
    // =========================
    const materias =
      JSON.parse(localStorage.getItem("materiasRecientes")) || [];
    setMateriasRecientes(materias);

    // =========================
    // CARGAR EVENTOS
    // =========================
    const eventos =
      JSON.parse(localStorage.getItem("eventosAlumno")) || [];

    const hoy = new Date();

    const proximos = eventos
      .filter(e => new Date(e.fecha) >= hoy)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .slice(0, 5);

    setRecientesEventos(proximos);

    // =========================
    // GENERAR NOTIFICACIONES
    // =========================
    let notificaciones =
      JSON.parse(localStorage.getItem("notificacionesAlumno")) || [];

    eventos.forEach(evento => {

      const fechaEvento = new Date(evento.fecha);
      const diff = Math.ceil(
        (fechaEvento - hoy) / (1000 * 60 * 60 * 24)
      );

      // Recordatorio mañana
      if (diff === 1) {
        notificaciones.push({
          tipo: "Recordatorio",
          mensaje: `Mañana tienes: ${evento.texto}`,
          fecha: new Date().toLocaleDateString(),
          leida: false,
        });
      }

      // Evento hoy
      if (diff === 0) {
        notificaciones.push({
          tipo: "Hoy",
          mensaje: `Hoy tienes: ${evento.texto}`,
          fecha: new Date().toLocaleDateString(),
          leida: false,
        });
      }
    });

    localStorage.setItem(
      "notificacionesAlumno",
      JSON.stringify(notificaciones)
    );

  }, []);

  return (
    <div>

      <h1 className="moodle-title">Inicio</h1>

      {/* ESTADÍSTICAS */}
      <div className="cards-container">
        <div className="card">
          <h3>Materias</h3>
          <p>{materiasRecientes.length}</p>
        </div>

        <div className="card">
          <h3>Promedio</h3>
          <p>8.5</p>
        </div>

        <div className="card">
          <h3>Asistencia</h3>
          <p>92%</p>
        </div>
      </div>

      {/* MATERIAS RECIENTES */}
      <h2 className="moodle-subtitle">Cursos recientes</h2>

      {materiasRecientes.length === 0 ? (
        <p>No hay cursos recientes</p>
      ) : (
        <div className="moodle-grid">
          {materiasRecientes.map((materia) => (
            <div key={materia.id} className="moodle-card small">
              <div
                className="moodle-card-img"
                style={{ backgroundImage: `url(${materia.imagen})` }}
              />
              <div className="moodle-card-body">
                <h4>{materia.nombre}</h4>
                <p>{materia.profesor}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PRÓXIMOS EVENTOS */}
      <h2 className="moodle-subtitle">Próximos eventos</h2>

      {recientesEventos.length === 0 ? (
        <p>No hay eventos próximos</p>
      ) : (
        <ul className="event-list">
          {recientesEventos.map((evento, i) => (
            <li key={i}>
              📅 {evento.fecha} — {evento.texto}
            </li>
          ))}
        </ul>
      )}

    </div>
  );
};

export default AlumnoDashboard;
