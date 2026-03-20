import "../../../src/css/directivo/panelDirectivo.css";
import { BookOpen, GraduationCap, UserCheck, Users, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DirectivoDashboard = () => {
  const navigate = useNavigate();

  // Datos de ejemplo, luego vendrán del backend
  const kpis = [
    { label: "Materias", value: 24, icon: <BookOpen size={28} />, color: "#3b82f6" },
    { label: "Docentes", value: 18, icon: <UserCheck size={28} />, color: "#10b981" },
    { label: "Alumnos", value: 320, icon: <GraduationCap size={28} />, color: "#f59e0b" },
    { label: "Tutores", value: 95, icon: <Users size={28} />, color: "#ef4444" },
  ];

  const recentActivities = [
    { text: "Nueva materia: Matemática", type: "success" },
    { text: "Docente registrado: Juan Pérez", type: "success" },
    { text: "5 alumnos inscritos", type: "info" },
    { text: "Tutor actualizado: Ana López", type: "warning" },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Panel Directivo</h1>

      {/* ================= KPIs ================= */}
      <div className="kpi-grid">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="kpi-card"
            style={{ background: kpi.color }}
            onClick={() => navigate(`/directivo/${kpi.label.toLowerCase()}`)}
          >
            <div className="kpi-icon">{kpi.icon}</div>
            <h2>{kpi.value}</h2>
            <p>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* ================= ACCESOS RAPIDOS ================= */}
      <div className="dashboard-grid">
        <div
          className="dashboard-card add-alumno"
          onClick={() => navigate("/directivo/alumnos")}
        >
          <div className="icon-box plus">
            <PlusCircle size={32} />
          </div>
          <h3>Agregar Alumno</h3>
          <p>Registrar rápidamente un nuevo alumno</p>
        </div>

        <div
          className="dashboard-card add-materia"
          onClick={() => navigate("/directivo/materias")}
        >
          <div className="icon-box plus">
            <PlusCircle size={32} />
          </div>
          <h3>Agregar Materia</h3>
          <p>Crear nueva materia</p>
        </div>
      </div>

      {/* ================= ACTIVIDAD RECIENTE ================= */}
      <div className="activity-section">
        <h2>Actividad reciente</h2>
        <ul>
          {recentActivities.map((act, idx) => (
            <li key={idx} className={`activity-${act.type}`}>
              {act.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
     
  );
};

export default DirectivoDashboard;