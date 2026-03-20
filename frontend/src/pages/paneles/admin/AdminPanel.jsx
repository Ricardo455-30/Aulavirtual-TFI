import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import Dashboard from "../../../components/admin/Dashboard";
import Users from "../../../components/admin/UsersSection";
import SettingsSection from "../../../components/admin/SettingsSection";
import "../../../css/ADMIN/admin.css";

const API = "http://localhost:8000/api/admin";

const AdminPanel = () => {

  const navigate = useNavigate();

  const [section, setSection] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [loginLogs, setLoginLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 Obtener token
  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // =============================
  // MANEJO GLOBAL DE RESPUESTAS
  // =============================
  const handleResponse = async (res) => {

    if (res.status === 401) {
      console.warn("Sesión expirada o no autorizada");
      localStorage.removeItem("token");
      navigate("/login");
      return null;
    }

    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error("Respuesta no es JSON:", text);
      return null;
    }
  };

  // =============================
  // CARGAR USUARIOS
  // =============================
  const cargarUsuarios = async () => {
    try {
      const res = await fetch(`${API}/usuarios`, {
        headers: getHeaders(),
      });

      const data = await handleResponse(res);

      if (data) setUsers(data);

    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  // =============================
  // CARGAR LOGINS
  // =============================
  const cargarLogins = async () => {
    try {
      const res = await fetch(`${API}/logins`, {
        headers: getHeaders(),
      });

      const data = await handleResponse(res);

      if (data) setLoginLogs(data);

    } catch (error) {
      console.error("Error cargando logins:", error);
    }
  };

  // =============================
  // INIT
  // =============================
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        cargarUsuarios(),
        cargarLogins()
      ]);
      setLoading(false);
    };

    init();
  }, []);

  // =============================
  // RENDER DINÁMICO
  // =============================
  const renderSection = () => {

    switch (section) {

      case "dashboard":
        return <Dashboard users={users} loginLogs={loginLogs} />;

      case "users":
        return <Users users={users} setUsers={setUsers} />;

      case "settings":
        return <SettingsSection />;

      default:
        return <Dashboard users={users} loginLogs={loginLogs} />;
    }
  };

  // =============================
  // LOADING UI
  // =============================
  if (loading) {
    return (
      <div className="admin-loading">
        <h2>Cargando panel...</h2>
      </div>
    );
  }

  return (
    <div className="admin-container">

      <AdminSidebar setSection={setSection} />

      <main className="admin-content">
        {renderSection()}
      </main>

    </div>
  );

};

export default AdminPanel;