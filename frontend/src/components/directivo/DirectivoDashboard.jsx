import "../../../src/css/directivo/panelDirectivo.css";
import { BookOpen, GraduationCap, UserCheck, Users } from "lucide-react";

const DirectivoDashboard = () => {
  return (
    <div className="dashboard-grid">

      <div className="dashboard-card">
        <BookOpen size={40} />
        <h3>Materias</h3>
        <p>Administrar y crear materias</p>
      </div>

      <div className="dashboard-card">
        <UserCheck size={40} />
        <h3>Docentes</h3>
        <p>Gestionar docentes</p>
      </div>

      <div className="dashboard-card">
        <GraduationCap size={40} />
        <h3>Alumnos</h3>
        <p>Gestionar alumnos</p>
      </div>

      <div className="dashboard-card">
        <Users size={40} />
        <h3>Tutores</h3>
        <p>Gestionar tutores</p>
      </div>

    </div>
  );
};

export default DirectivoDashboard;