import React, { useState } from "react";
import AlumnoHeader from "../components/alumno/AlumnoHeader";
import AlumnoSidebar from "../components/alumno/AlumnoSidebar";
import AlumnoFooter from "../components/alumno/AlumnoFooter";
import CicloFiltro from "../components/common/CicloFiltro";

import InicioAlumno from "../components/alumno/Inicoalumno";
import InscripcionMaterias from "../components/alumno/InscripcionMaterias";
import MisMaterias from "../components/alumno/AlumnoMaterias";
import EnviarTareas from "../components/alumno/EnviarTareas";
import MisNotas from "../components/alumno/Misnotas";

import "../css/alumno.css"

const AlumnoDashboard = () => {
  const [section, setSection] = useState("inicio");
  const [selectedCiclo, setSelectedCiclo] = useState("");

  const renderSection = () => {
    switch (section) {
      case "inicio":
        return <InicioAlumno setSection={setSection} />;

      case "inscripciones":
        return <InscripcionMaterias setSection={setSection} idCiclo={selectedCiclo} />;

      case "mis-materias":
        return <MisMaterias setSection={setSection} idCiclo={selectedCiclo} />;

      case "enviar-tareas":
        return <EnviarTareas setSection={setSection} idCiclo={selectedCiclo} />;

      case "notas":
        return <MisNotas setSection={setSection} idCiclo={selectedCiclo} />;

      default:
        return <InicioAlumno setSection={setSection} />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AlumnoSidebar section={section} setSection={setSection} />

      {/* Main */}
      <div className="admin-main">
        {/* Header */}
        <AlumnoHeader section={section} />

        <div style={{ padding: "0 24px 24px" }}>
          <CicloFiltro selectedCiclo={selectedCiclo} onChange={setSelectedCiclo} />
        </div>

        {/* Contenido */}
        <div className="admin-content">
          {renderSection()}
        </div>

        {/* Footer */}
        <AlumnoFooter />
      </div>
    </div>
  );
};

export default AlumnoDashboard;