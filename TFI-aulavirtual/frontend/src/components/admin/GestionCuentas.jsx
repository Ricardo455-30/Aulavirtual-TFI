import React, { useState, useRef, useEffect } from "react";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiRefreshCw,
  FiUsers,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import axios from "axios";
import AdminPendientes from "./AdminPendientes";
import AdminAprobados from "./AdminAprobados";
import AdminRechazados from "./AdminRechazados";
import "../../css/GestionCuentas.css";

const GestionCuentas = () => {
  const [tab, setTab] = useState("pendientes");
  const [conteos, setConteos] = useState({
    pendientes: 0,
    aprobados: 0,
    rechazados: 0,
  });
  const [loading, setLoading] = useState(true);

  const pendientesRef = useRef();
  const aprobadosRef = useRef();
  const rechazadosRef = useRef();

  // Cargar conteos de usuarios
  useEffect(() => {
    const cargarConteos = async () => {
      try {
        const token = localStorage.getItem("token");
        let pendientes = 0, aprobados = 0, rechazados = 0;

        try {
          // Obtener pendientes
          const pendientesRes = await axios.get(
            "http://localhost:8000/api/auth/pendientes",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          pendientes = pendientesRes.data?.length || 0;
        } catch (err) {
          console.warn("Error cargando pendientes:", err.message);
        }

        try {
          // Obtener aprobados
          const aprobadosRes = await axios.get(
            "http://localhost:8000/api/auth/aprobados",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          aprobados = aprobadosRes.data?.length || 0;
        } catch (err) {
          console.warn("Error cargando aprobados:", err.message);
        }

        try {
          // Obtener rechazados
          const rechazadosRes = await axios.get(
            "http://localhost:8000/api/auth/rechazados",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          rechazados = rechazadosRes.data?.length || 0;
        } catch (err) {
          console.warn("Error cargando rechazados:", err.message);
        }

        setConteos({ pendientes, aprobados, rechazados });
      } catch (err) {
        console.error("Error cargando conteos:", err);
        setConteos({ pendientes: 0, aprobados: 0, rechazados: 0 });
      } finally {
        setLoading(false);
      }
    };

    cargarConteos();
    
    // Recargar conteos cada 15 segundos
    const interval = setInterval(cargarConteos, 15000);
    return () => clearInterval(interval);
  }, []);

  const recargarTodo = () => {
    pendientesRef.current?.recargar?.();
    aprobadosRef.current?.recargar?.();
    rechazadosRef.current?.recargar?.();
    
    // Recargar conteos también
    setTimeout(() => {
      const cargarConteos = async () => {
        try {
          const token = localStorage.getItem("token");
          let pendientes = 0, aprobados = 0, rechazados = 0;

          try {
            const pendientesRes = await axios.get(
              "http://localhost:8000/api/admin/pendientes",
              { headers: { Authorization: `Bearer ${token}` } }
            );
            pendientes = pendientesRes.data?.length || 0;
          } catch (err) {
            console.warn("Error recargando pendientes:", err.message);
          }

          try {
            const aprobadosRes = await axios.get(
              "http://localhost:8000/api/admin/aprobados",
              { headers: { Authorization: `Bearer ${token}` } }
            );
            aprobados = aprobadosRes.data?.length || 0;
          } catch (err) {
            console.warn("Error recargando aprobados:", err.message);
          }

          try {
            const rechazadosRes = await axios.get(
              "http://localhost:8000/api/admin/rechazados",
              { headers: { Authorization: `Bearer ${token}` } }
            );
            rechazados = rechazadosRes.data?.length || 0;
          } catch (err) {
            console.warn("Error recargando rechazados:", err.message);
          }

          setConteos({ pendientes, aprobados, rechazados });
        } catch (err) {
          console.error("Error recargando conteos:", err);
        }
      };
      cargarConteos();
    }, 500);
  };

  const handleRefresh = async () => {
    setLoading(true);
    recargarTodo();
    setLoading(false);
  };

  return (
    <div className="gestion-cuentas-container">
      {/* HEADER */}
      <div className="gestion-header">
        <div className="header-content">
          <h1 className="header-title">
            <FiUsers className="header-icon" />
            Gestión de Cuentas de Usuario
          </h1>
          <p className="header-subtitle">
            Aprueba, rechaza o visualiza solicitudes de registro pendientes
          </p>
        </div>

        <button
          className={`btn-refresh ${loading ? "spinning" : ""}`}
          onClick={handleRefresh}
          disabled={loading}
        >
          <FiRefreshCw /> Actualizar
        </button>
      </div>

      {/* TABS MEJORADAS */}
      <div className="gestion-tabs">
        <button
          className={`tab-button ${tab === "pendientes" ? "active" : ""} ${
            conteos.pendientes > 0 ? "has-alert" : ""
          }`}
          onClick={() => setTab("pendientes")}
        >
          <div className="tab-title">
            <FiAlertCircle className="tab-icon" />
            Pendientes de Revisión
          </div>
          <div className={`tab-badge ${conteos.pendientes > 0 ? "urgent" : ""}`}>
            {loading ? "..." : conteos.pendientes}
          </div>
        </button>

        <button
          className={`tab-button ${tab === "aprobados" ? "active" : ""}`}
          onClick={() => setTab("aprobados")}
        >
          <div className="tab-title">
            <FiCheckCircle className="tab-icon" />
            Cuentas Aprobadas
          </div>
          <div className="tab-badge">
            {loading ? "..." : conteos.aprobados}
          </div>
        </button>

        <button
          className={`tab-button ${tab === "rechazados" ? "active" : ""}`}
          onClick={() => setTab("rechazados")}
        >
          <div className="tab-title">
            <FiX className="tab-icon" />
            Cuentas Rechazadas
          </div>
          <div className="tab-badge">
            {loading ? "..." : conteos.rechazados}
          </div>
        </button>
      </div>

      {/* Separador bajo los tabs */}
      <div className="tabs-separator"></div>

      {/* CONTENIDO */}
      <div className="gestion-content">
        {tab === "pendientes" && (
          <div className="tab-content animate-in">
            <AdminPendientes ref={pendientesRef} recargarListas={recargarTodo} />
          </div>
        )}

        {tab === "aprobados" && (
          <div className="tab-content animate-in">
            <AdminAprobados ref={aprobadosRef} />
          </div>
        )}

        {tab === "rechazados" && (
          <div className="tab-content animate-in">
            <AdminRechazados ref={rechazadosRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionCuentas;