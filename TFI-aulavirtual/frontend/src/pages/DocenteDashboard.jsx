import React, { useState } from "react";
import "../css/docente.css";

// Layout
import DocenteSidebar from "../components/docente/DocenteSidebar";
import DocenteHeader from "../components/docente/DocenteHeader";
import DocenteFooter from "../components/docente/DocenteFooter";

// Secciones
import InicioDocente from "../components/docente/InicioDocente";
import MisMaterias from "../components/docente/MisMaterias";
import CargarNotas from "../components/docente/MisMaterias";
import AsistenciaDocente from "../components/docente/AsistenciaDocente";

const DocenteDashboard = () => {
  const [section, setSection] = useState("inicio");

  const renderSection = () => {
    switch (section) {
      case "inicio":
        return <InicioDocente />;

      case "materias":
        return <MisMaterias />;

      case "notas":
        return <CargarNotas />;

      case "asistencia":
        return <AsistenciaDocente />;

      default:
        return (
          <div className="section">
            <h2>Inicio</h2>
            <p>Bienvenido al panel docente.</p>
          </div>
        );
    }
  };

  return (
    <div className="docente-layout">
      {/* Sidebar */}
      <DocenteSidebar section={section} setSection={setSection} />

      {/* Main */}
      <div className="docente-main">
        {/* Header */}
        <DocenteHeader />

        {/* Content */}
        <div className="docente-content">
          {renderSection()}
        </div>

        {/* Footer */}
        <DocenteFooter />
      </div>
    </div>
  );
};

export default DocenteDashboard;