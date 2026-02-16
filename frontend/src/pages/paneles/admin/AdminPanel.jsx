import React, { useState, useEffect } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import Dashboard from "../../../components/admin/Dashboard";
import Users from "../../../components/admin/UsersSection";
import "../../../css/ADMIN/admin.css";
import SettingsSection from "../../../components/admin/SettingsSection";


const AdminPanel = () => {
  const [section, setSection] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [loginLogs, setLoginLogs] = useState([]);

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("admin_users"));
    const storedLogs = JSON.parse(localStorage.getItem("login_logs"));

    if (storedUsers) {
      setUsers(storedUsers);
    } else {
      const defaultUsers = [
        { id: 1, name: "Juan Pérez", email: "juan@mail.com", role: "Docente" },
        { id: 2, name: "María López", email: "maria@mail.com", role: "Alumno" },
      ];
      setUsers(defaultUsers);
      localStorage.setItem("admin_users", JSON.stringify(defaultUsers));
    }

    if (storedLogs) {
      setLoginLogs(storedLogs);
    } else {
      const today = new Date().toISOString().split("T")[0];
      const demoLogs = [
        { date: today },
        { date: today },
        { date: today },
        { date: "2026-02-01" },
      ];
      setLoginLogs(demoLogs);
      localStorage.setItem("login_logs", JSON.stringify(demoLogs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("admin_users", JSON.stringify(users));
  }, [users]);

  return (
    <div className="admin-container">
      <AdminSidebar setSection={setSection} />

      <main className="admin-content">
        {section === "dashboard" && (
          <Dashboard users={users} loginLogs={loginLogs} />
        )}

        {section === "users" && (
          <Users users={users} setUsers={setUsers} />
        )}
        {section === "settings" && <SettingsSection />}
        
      </main>
    </div>
  );
};

export default AdminPanel;
