import { useState } from "react";
import Sidebar from "../../../components/directivo/Sidebar";
import UsersDirectivo from "../../../components/directivo/UsersSectionDirectivo";
import "../../../css/directivo/panelDirectivo.css";

const PanelDirectivo = () => {
  const [seccionActiva, setSeccionActiva] = useState("dashboard");

  const renderSeccion = () => {
    switch (seccionActiva) {
      case "dashboard":
        return <h1>Bienvenido al Panel Directivo</h1>;
      case "usuarios":
        return <UsersDirectivo />;
      case "configuracion":
        return <h1>Configuración (en desarrollo)</h1>;
      default:
        return <h1>Bienvenido al Panel Directivo</h1>;
    }
  };

  
  return (
    <div className="panel-layout">
      <Sidebar setSeccionActiva={setSeccionActiva} />
      <div className="contenido">
        {renderSeccion()}
      </div>
    </div>
  );
};

export default PanelDirectivo;