import React, { useState } from "react";
import AlumnoSidebar from "../../components/alumnos/AlumnoSidebar";
import AlumnoDashboard from "../../components/alumnos/AlumnoDashboard";
import AlumnoMaterias from "../../components/alumnos/AlumnoMaterias";
import AlumnoNotas from "../../components/alumnos/AlumnoNotas";
import AlumnoAsistencia from "../../components/alumnos/AlumnoAsistencia";
import AlumnoPerfil from "../../components/alumnos/AlumnoPerfil";
import AlumnoCalendario from "../../components/alumnos/AlumnoCalendario"; 
import AlumnoNotificaciones from "../../components/alumnos/AlumnoNotificaciones";


import "../../css/alumno/alumno.css";

const AlumnoPanel = () => {
  const [section, setSection] = useState("dashboard");

  const renderSection = () => {
    switch (section) {
      case "materias":
        return <AlumnoMaterias />;
      case "notas":
        return <AlumnoNotas />;
      case "asistencia":
        return <AlumnoAsistencia />;
      case "perfil":
        return <AlumnoPerfil />;
      default:
        return <AlumnoDashboard />;
        case "calendario":
  return <AlumnoCalendario />;
  case "notificaciones":
  return <AlumnoNotificaciones />;


    }
  };

  return (
    <div className="alumno-container">
      <AlumnoSidebar setSection={setSection} />
      <div className="alumno-content">
        {renderSection()}
      </div>
      
    </div>
  );
};

export default AlumnoPanel;
