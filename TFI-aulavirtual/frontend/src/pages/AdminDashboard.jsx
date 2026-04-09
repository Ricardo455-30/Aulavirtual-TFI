import React, { useState } from "react";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminFooter from "../components/admin/AdminFooter";
import Inicio from "../components/admin/Inicio";
import GestionCuentas from "../components/admin/GestionCuentas";
import ConfigSection from "../components/admin/SettingsSection";
import UsersSection from "../components/admin/UsersSection";



import "../css/admin.css";

const AdminDashboard = () => {
  const [section, setSection] = useState("inicio");


  const renderSection = () => {
    switch (section) {
      case "inicio":
        return <Inicio setSection={setSection} />;

      case "aprobaciones":
        return <GestionCuentas  />;

      case "exportar":
        return <UsersSection />;

      case "backups":
        return <ConfigSection />;

      default:
        return <Inicio setSection={setSection} />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminSidebar section={section} setSection={setSection} />

      {/* Main */}
      <div className="admin-main">
        {/* Header */}
        <AdminHeader section={section} />

        {/* Contenido dinámico */}
        <div className="admin-content">
          {renderSection()}
        </div>

        {/* Footer */}
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminDashboard;