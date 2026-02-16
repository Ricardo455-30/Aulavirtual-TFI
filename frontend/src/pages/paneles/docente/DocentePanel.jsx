import React, { useState } from "react";
import DocenteSidebar from "../../../components/docente/DocenteSidebar";
import DocenteDashboard from "../../../components/docente/DocenteDashboard";
import CursosSection from "../../../components/docente/CursosSection";
import AlumnosSection from "../../../components/docente/AlumnosSection";
import CalificacionesSection from "../../../components/docente/CalificacionesSection";
import ComunicadosSection from "../../../components/docente/ComunicadosSection";
import PerfilDocente from "../../../components/docente/PerfilDocente";
import "../../../css/docente/docente.css";

const DocentePanel = () => {
  const [section, setSection] = useState("dashboard");

  const renderSection = () => {
    switch (section) {
      case "dashboard":
        return <DocenteDashboard />;
      case "cursos":
        return <CursosSection />;
      case "alumnos":
        return <AlumnosSection />;
      case "calificaciones":
        return <CalificacionesSection />;
      case "comunicados":
        return <ComunicadosSection />;
      case "perfil":
        return <PerfilDocente />;
      default:
        return <DocenteDashboard />;
    }
  };

  return (
    <div className="docente-container">
      <DocenteSidebar setSection={setSection} />
      <div className="docente-content">
        {renderSection()}
      </div>
    </div>
  );
};

export default DocentePanel;
