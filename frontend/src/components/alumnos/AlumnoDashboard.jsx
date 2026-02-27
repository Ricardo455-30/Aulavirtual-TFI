import MateriasRecientes from "./MateriasRecientes";
import CalendarioWidget from "./CalendarioWidget";
import NotificacionesWidget from "./NotificacionesWidget";
import "../../css/alumno/dashboard.css";

const AlumnoDashboard = () => {
  return (
    <div className="dashboard-container">
      <h2 className="bienvenida">¡Bienvenido Ricardo! 👋</h2>

      <div className="dashboard-grid">
        <MateriasRecientes />
        <CalendarioWidget />
        <NotificacionesWidget />
      </div>
    </div>
  );
};

export default AlumnoDashboard;