import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiCheckCircle,
  FiDatabase,
  FiArrowRight,
  FiShield,
  FiAlertCircle,
  FiActivity,
} from "react-icons/fi";
import axios from "axios";
import "../../css/inicio.css";

const Inicio = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    usuariosPendientes: 0,
    usuariosActivos: 0,
    usuariosTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const token = localStorage.getItem("token");

        // Obtener conteos de usuarios
        const res = await axios.get(
          "http://localhost:8000/api/admin/estadisticas",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStats({
          usuariosPendientes: res.data?.pendientes || 0,
          usuariosActivos: res.data?.activos || 0,
          usuariosTotal: res.data?.total || 0,
        });
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
        // Si falla, usar valores por defecto
        setStats({
          usuariosPendientes: 0,
          usuariosActivos: 0,
          usuariosTotal: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
    
    // Recargar estadísticas cada 10 segundos para que se vea actualizado
    const interval = setInterval(cargarEstadisticas, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      id: "usuarios",
      icon: FiUsers,
      title: "Gestión de Usuarios",
      description: "Administra, edita y controla todos los usuarios del sistema.",
      color: "usuarios",
      action: () => navigate("/admin/usuarios"),
      badge: `${stats.usuariosTotal}`,
      badgeLabel: "Usuarios",
      details: `${stats.usuariosActivos} activos`,
    },
    {
      id: "aprobacion",
      icon: FiCheckCircle,
      title: "Aprobación de Cuentas",
      description: "Revisa y aprueba nuevos registros pendientes de validación.",
      color: "aprobacion",
      action: () => navigate("/admin/cuentas-pendientes"),
      badge: `${stats.usuariosPendientes}`,
      badgeLabel: "Pendientes",
      badge_color: "pending",
      details: "Cuentas por revisar",
      urgent: stats.usuariosPendientes > 0,
    },
    {
      id: "backup",
      icon: FiDatabase,
      title: "Copias de Seguridad",
      description: "Realiza y gestiona copias de seguridad de la base de datos.",
      color: "backup",
      action: () => navigate("/admin/backup"),
      details: "Última copia: hace 2 días",
    },
    {
      id: "seguridad",
      icon: FiShield,
      title: "Seguridad del Sistema",
      description: "Configura permisos, roles y políticas de seguridad.",
      color: "seguridad",
      action: () => navigate("/admin/seguridad"),
      details: "Sistema protegido",
    },
  ];

  return (
    <div className="inicio-container">
      <div className="inicio-wrapper">
        {/* HEADER */}
        <div className="inicio-header">
          <div className="inicio-header-top">
            <FiShield />
          </div>
          <h1>Bienvenido, Administrador</h1>
          <p>
            Gestiona el sistema, aprueba cuentas y realiza copias de seguridad
          </p>
        </div>

        {/* ESTADÍSTICAS */}
        <div className="inicio-stats">
          <div className="stat-card">
            <div className="stat-icon usuarios">
              <FiUsers />
            </div>
            <div className="stat-info">
              <h3>Total de Usuarios</h3>
              <div className="valor">{loading ? "..." : stats.usuariosTotal}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon aprobacion">
              <FiActivity />
            </div>
            <div className="stat-info">
              <h3>Usuarios Activos</h3>
              <div className="valor">{loading ? "..." : stats.usuariosActivos}</div>
            </div>
          </div>

          <div className={`stat-card ${stats.usuariosPendientes > 0 ? "warning" : ""}`}>
            <div className={`stat-icon pending ${stats.usuariosPendientes > 0 ? "pulse" : ""}`}>
              <FiAlertCircle />
            </div>
            <div className="stat-info">
              <h3>Pendientes de Revisión</h3>
              <div className="valor">{loading ? "..." : stats.usuariosPendientes}</div>
            </div>
          </div>
        </div>

        {/* CARDS PRINCIPALES */}
        <div className="inicio-cards">
          {cards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.id}
                className={`card ${card.color} ${card.urgent ? "urgent" : ""}`}
              >
                {/* URGENT BADGE */}
                {card.urgent && (
                  <div className="card-urgent-badge">
                    <FiAlertCircle /> Requiere atención
                  </div>
                )}

                {/* ICON */}
                <div className={`card-icon ${card.color}`}>
                  <IconComponent />
                </div>

                {/* TITLE */}
                <h3>{card.title}</h3>

                {/* DESCRIPTION */}
                <p>{card.description}</p>

                {/* BADGE */}
                {card.badge && (
                  <div className={`card-badge ${card.badge_color || ""}`}>
                    <span className="badge-value">{card.badge}</span>
                    <span className="badge-label">{card.badgeLabel}</span>
                  </div>
                )}

                {/* DETAILS */}
                {card.details && (
                  <div className="card-details">
                    <span>{card.details}</span>
                  </div>
                )}

                {/* BUTTON */}
                <button className="card-button" onClick={card.action}>
                  Acceder
                  <FiArrowRight className="button-icon" />
                </button>
              </div>
            );
          })}
        </div>

        {/* INFO FOOTER */}
        <div className="inicio-footer">
          <div className="footer-info">
            <FiShield className="footer-icon" />
            <p>
              Sistema seguro con autenticación de dos factores y auditoría completa de
              actividades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;