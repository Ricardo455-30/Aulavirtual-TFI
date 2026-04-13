import React, { useState, useRef, useEffect } from "react";
import { FiAlertCircle, FiCheckCircle, FiXCircle } from "react-icons/fi";
import AdminPendientes from "./DirectivoPendientes";
import AdminAprobados from "./DirectivoAprobados";
import AdminRechazados from "./DirectivoRechazados";
import "../../css/GestionCuentas.css";

const GestionCuentas = () => {
  const [tab, setTab] = useState("pendientes");
  const [pendientesCount, setPendientesCount] = useState(0);
  const [aprobadosCount, setAprobadosCount] = useState(0);
  const [rechazadosCount, setRechazadosCount] = useState(0);

  const pendientesRef = useRef();
  const aprobadosRef = useRef();
  const rechazadosRef = useRef();

  const token = localStorage.getItem("token");

  // Cargar conteos iniciales
  useEffect(() => {
    cargarConteos();
  }, []);

  const cargarConteos = async () => {
    try {
      const [pendientes, aprobados, rechazados] = await Promise.all([
        fetch("http://localhost:8000/api/auth/pendientes", {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()),
        fetch("http://localhost:8000/api/auth/aprobados", {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).catch(() => []),
        fetch("http://localhost:8000/api/auth/rechazados", {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).catch(() => [])
      ]);

      setPendientesCount(pendientes?.length || 0);
      setAprobadosCount(aprobados?.length || 0);
      setRechazadosCount(rechazados?.length || 0);
    } catch (error) {
      console.error("Error cargando conteos:", error);
    }
  };

  const recargarTodo = async () => {
    pendientesRef.current?.recargar?.();
    aprobadosRef.current?.recargar?.();
    rechazadosRef.current?.recargar?.();
    await cargarConteos();
  };

  return (
    <div className="gestion-cuentas-container">
      {/* Header mejorado */}
      <div className="gestion-header">
        <div className="gestion-title">
          <h1>Gestión de Cuentas</h1>
          <p>Aprueba o rechaza solicitudes de registro de usuarios</p>
        </div>

        {/* Notificación de pendientes */}
        {pendientesCount > 0 && (
          <div className="notification-badge">
            <FiAlertCircle className="icon-alert" />
            <span className="badge-text">
              <strong>{pendientesCount}</strong> cuenta{pendientesCount !== 1 ? 's' : ''} pendiente{pendientesCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* 🔹 SUB NAV - Mejorado */}
      <div className="sub-navbar-improved">
        <button
          className={`tab-button ${tab === "pendientes" ? "active-tab" : ""}`}
          onClick={() => setTab("pendientes")}
        >
          <FiAlertCircle className="tab-icon" />
          <span>Pendientes</span>
          {pendientesCount > 0 && <span className="count-badge">{pendientesCount}</span>}
        </button>

        <button
          className={`tab-button ${tab === "aprobados" ? "active-tab" : ""}`}
          onClick={() => setTab("aprobados")}
        >
          <FiCheckCircle className="tab-icon" />
          <span>Aprobados</span>
          {aprobadosCount > 0 && <span className="count-badge approved">{aprobadosCount}</span>}
        </button>

        <button
          className={`tab-button ${tab === "rechazados" ? "active-tab" : ""}`}
          onClick={() => setTab("rechazados")}
        >
          <FiXCircle className="tab-icon" />
          <span>Rechazados</span>
          {rechazadosCount > 0 && <span className="count-badge rejected">{rechazadosCount}</span>}
        </button>
      </div>

      {/* 🔹 CONTENIDO */}
      {tab === "pendientes" && (
        <AdminPendientes ref={pendientesRef} recargarListas={recargarTodo} />
      )}

      {tab === "aprobados" && (
        <AdminAprobados ref={aprobadosRef} />
      )}

      {tab === "rechazados" && (
        <AdminRechazados ref={rechazadosRef} />
      )}
    </div>
  );
};

export default GestionCuentas;