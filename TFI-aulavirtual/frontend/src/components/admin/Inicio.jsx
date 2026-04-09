import React from "react";
import { FiUsers, FiCheckCircle, FiDatabase } from "react-icons/fi";
import "../../css/inicio.css";

const Inicio = () => {
  return (
    <div className="inicio-container">
      
      {/* Bienvenida */}
      <div className="inicio-header">
        <h1>Bienvenido, Administrador </h1>
        <p>
          Gestiona usuarios, aprueba cuentas y realiza copias de seguridad del sistema.
        </p>
      </div>

      {/* Cards */}
      <div className="inicio-cards">

        <div className="card">
          <div className="card-icon usuarios">
            <FiUsers />
          </div>
          <h3>Gestión de Usuarios</h3>
          <p>Administra, edita y controla los usuarios del sistema.</p>
          <button>Ir</button>
        </div>

        <div className="card">
          <div className="card-icon aprobacion">
            <FiCheckCircle />
          </div>
          <h3>Aprobación de Cuentas</h3>
          <p>Revisa y aprueba nuevos registros pendientes.</p>
          <button>Ir</button>
        </div>

        <div className="card">
          <div className="card-icon backup">
            <FiDatabase />
          </div>
          <h3>Backup</h3>
          <p>Realiza copias de seguridad de la base de datos.</p>
          <button>Ir</button>
        </div>

      </div>
    </div>
  );
};

export default Inicio;