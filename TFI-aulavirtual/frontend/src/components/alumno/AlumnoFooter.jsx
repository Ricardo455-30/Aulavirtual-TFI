import React from "react";

const AdminFooter = () => {
  return (
    <footer className="admin-footer">
      <div className="footer-left">
        © {new Date().getFullYear()} Aula Virtual
      </div>

      <div className="footer-center">
        Sistema de gestión de usuarios
      </div>

      <div className="footer-right">
        Versión 1.0
      </div>
    </footer>
  );
};

export default AdminFooter;