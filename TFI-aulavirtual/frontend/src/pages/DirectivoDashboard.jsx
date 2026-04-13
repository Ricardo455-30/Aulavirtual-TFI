import React, { useState } from "react";
import "../css/Directivo.css";
import Inicio from "../components/directivo/Inicio";
import DirectivoSidebar from "../components/directivo/DirectivoSidebar";
import DirectivoHeader from "../components/directivo/DirectivoHeader";
import DirectivoFooter from "../components/directivo/DirectivoFooter";
import GestionCuentas from "../components/directivo/GestionCuentas";
import DirectivoMaterias from "../components/directivo/DiretivoMaterias";
import NotasAlumnos from "../components/directivo/NotasAlumnos";
import AsignarCurso from "../components/directivo/AsignarCurso";
 
import DirectivoAsistencia from "../components/directivo/DirectivoAsistencia";
const DirectivoDashboard = () => {
  const [section, setSection] = useState("inicio");
   



  const renderSection = () => {
    switch (section) {
      case "inicio":
        return <Inicio setSection={setSection} />;

      case "aprobados":
        return <GestionCuentas />;
      
      case "materias":
        return <DirectivoMaterias />;
      

      case "dms":
        return <NotasAlumnos />;

      case "asignar-curso":
        return <AsignarCurso />;

      case "asistencia":
        return <DirectivoAsistencia />;


        

      default:
        return (
          <div className="section">
            <h2>Inicio</h2>
            <p>Bienvenido al dashboard de directivo.</p>
          </div>
        );
    }
  };

  return (
    <div className="directivo-layout">
      {/* Sidebar */}
      <DirectivoSidebar section={section} setSection={setSection} />
      

      {/* Main */}
      <div className="directivo-main">
        {/* Header */}
        <DirectivoHeader />

        {/* Content */}
        <div className="directivo-content">{renderSection()}</div>
        {/* Footer */}
        <DirectivoFooter />

      </div>
    </div>
  );
};

export default DirectivoDashboard;