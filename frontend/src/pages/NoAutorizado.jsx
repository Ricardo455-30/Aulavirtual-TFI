import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "../css/noAutorizado.css";

const NoAutorizado = () => {
  const navigate = useNavigate();

  return (
    <div className="noauth-container">
      <div className="noauth-card">
        <div className="icon">🚫</div>

        <h1>Acceso denegado</h1>

        <p>
          No tienes permisos para acceder a esta sección.
          <br />
          Si crees que esto es un error, contacta al administrador.
        </p>

        <button onClick={() => navigate(-1)} className="btn-volver">
          <FiArrowLeft /> Volver
        </button>
      </div>
    </div>
  );
};

export default NoAutorizado;