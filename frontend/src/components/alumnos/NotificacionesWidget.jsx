const notificaciones = [
  { id: 1, mensaje: "Nueva tarea subida en Programación III" },
  { id: 2, mensaje: "Cambio de fecha en parcial de Base de Datos" },
  { id: 3, mensaje: "Mensaje del docente en Redes" },
];

const NotificacionesWidget = () => {
  return (
    <div className="card notificaciones">
      <h3>Notificaciones</h3>
      {notificaciones.map((n) => (
        <div key={n.id} className="notificacion-item">
          🔔 {n.mensaje}
        </div>
      ))}
    </div>
  );
};

export default NotificacionesWidget;