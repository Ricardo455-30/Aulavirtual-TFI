import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import DocenteSidebar from "../../../components/docente/DocenteSidebar";
import DocenteDashboard from "../../../components/docente/DocenteDashboard";
import CursosSection from "../../../components/docente/CursosSection";
import AlumnosSection from "../../../components/docente/AlumnosSection";
import CalificacionesSection from "../../../components/docente/CalificacionesSection";
import ComunicadosSection from "../../../components/docente/ComunicadosSection";
import PerfilDocente from "../../../components/docente/PerfilDocente";
import AsistenciaSection from "../../../components/docente/AsistenciaSection";
import MaterialesEstudio from "../../../components/docente/MaterialesEstudio"; // <-- nuevo

import "../../../css/docente/docente.css";

const DocentePanel = () => {
  const [section, setSection] = useState("dashboard");
  const navigate = useNavigate();

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // si guardas info del usuario
    navigate("/login"); // redirige al login
  };

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
      case "asistencias":
        return <AsistenciaSection />;
      case "materiales": // <-- nuevo
        return <MaterialesEstudio />;
      default:
        return <DocenteDashboard />;
    }
  };

  return (
    <div className="docente-container">
      <DocenteSidebar
        setSection={setSection}
        section={section}
        handleLogout={handleLogout}
      />
      <div className="docente-content">
        {renderSection()}
      </div>
    </div>
  );
};

export default DocentePanel;