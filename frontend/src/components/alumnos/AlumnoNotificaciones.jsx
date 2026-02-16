import React, { useEffect, useState } from "react";

const AlumnoNotificaciones = () => {

  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    const guardadas =
      JSON.parse(localStorage.getItem("notificacionesAlumno")) || [];
    setNotificaciones(guardadas);
  }, []);

  const marcarComoLeida = (index) => {
    const actualizadas = [...notificaciones];
    actualizadas[index].leida = true;

    localStorage.setItem(
      "notificacionesAlumno",
      JSON.stringify(actualizadas)
    );

    setNotificaciones(actualizadas);
  };

  const limpiarNotificaciones = () => {
    localStorage.removeItem("notificacionesAlumno");
    setNotificaciones([]);
  };

  return (
    <div>
      <h1 className="moodle-title">Notificaciones</h1>

      {notificaciones.length === 0 ? (
        <p>No hay notificaciones</p>
      ) : (
        <>
          <button
            className="btn-clear"
            onClick={limpiarNotificaciones}
          >
            Limpiar todas
          </button>

          <ul className="notificaciones-list">
            {notificaciones.map((n, i) => (
              <li
                key={i}
                className={n.leida ? "leida" : "no-leida"}
                onClick={() => marcarComoLeida(i)}
              >
                <div className="notif-header">
                  <span>{n.tipo}</span>
                  <small>{n.fecha}</small>
                </div>
                <p>{n.mensaje}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default AlumnoNotificaciones;
