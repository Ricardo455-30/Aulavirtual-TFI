import React, { useEffect, useState } from "react";

const AdminHeader = ({ section }) => {
  const titles = {
    inicio: "",
    aprobaciones: "Aprobación de cuentas",
    exportar: "Exportar cuentas",
    backups: "Backups",
  };

  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 🔴 Si no hay token → logout directo
    if (!token) {
      handleLogout();
      return;
    }

    // ⚡ Cargar rápido desde localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 🔴 Token inválido o expirado
        if (res.status === 401) {
          handleLogout();
          return;
        }

        if (!res.ok) {
          throw new Error("Error al obtener usuario");
        }

        const data = await res.json();

        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));

      } catch (error) {
        console.error("Error al obtener usuario:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // =======================
  // INICIALES DEL USUARIO
  // =======================
  const getInitials = () => {
    if (!user) return "?";

    const nombre = user.nombre?.trim() || "";
    const apellido = user.apellido?.trim() || "";

    const inicialNombre = nombre.charAt(0) || "";
    const inicialApellido = apellido.charAt(0) || "";

    return (inicialNombre + inicialApellido || "?").toUpperCase();
  };

  return (
    <header className="admin-header">

      {/* IZQUIERDA */}
      <div className="header-left">
        <h1>{titles[section] || ""}</h1>
        <span className="breadcrumb">
           {titles[section] || ""}
        </span>
      </div>

      {/* DERECHA */}
      <div className="header-right">

        {/* USUARIO */}
        <div className="header-user">

          {/* AVATAR */}
          <div className="avatar">
            {getInitials()}
          </div>

          <span className="user-name">
            {user ? `${user.nombre} ${user.apellido || ""}` : "Cargando..."}
          </span>
        </div>

        {/* LOGOUT */}
        <button className="btn-logout-header" onClick={handleLogout}>
          Cerrar sesión
        </button>

      </div>
    </header>
  );
};

export default AdminHeader;