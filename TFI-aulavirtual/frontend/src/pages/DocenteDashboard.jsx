import React, { useState } from "react";
import "../css/docente.css";
import CicloFiltro from "../components/common/CicloFiltro";

// Layout
import DocenteSidebar from "../components/docente/DocenteSidebar";
import DocenteHeader from "../components/docente/DocenteHeader";
import DocenteFooter from "../components/docente/DocenteFooter";

// Secciones
import InicioDocente from "../components/docente/InicioDocente";
import MisMaterias from "../components/docente/MisMaterias";
import CrearTareas from "../components/docente/CrearTareas";
import RecibirTarea from "../components/docente/RecibirTarea";
import CargarNotas from "../components/docente/CargarNotas";
import AsistenciaDocente from "../components/docente/AsistenciaDocente";

const DocenteDashboard = () => {
  const [section, setSection] = useState("inicio");
  const [selectedCiclo, setSelectedCiclo] = useState("");

  const renderSection = () => {
    switch (section) {
      case "inicio":
        return <InicioDocente setSection={setSection} idCiclo={selectedCiclo} />;

      case "materias":
        return <MisMaterias setSection={setSection} idCiclo={selectedCiclo} />;

      case "crear-tareas":
        return <CrearTareas setSection={setSection} idCiclo={selectedCiclo} />;

      case "tareas":
        return <RecibirTarea setSection={setSection} idCiclo={selectedCiclo} />;

      case "notas":
        return <CargarNotas setSection={setSection} idCiclo={selectedCiclo} />;

      case "asistencia":
        return <AsistenciaDocente setSection={setSection} idCiclo={selectedCiclo} />;

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

        <div style={{ padding: "0 24px 12px" }}>
          <CicloFiltro selectedCiclo={selectedCiclo} onChange={setSelectedCiclo} />
        </div>

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