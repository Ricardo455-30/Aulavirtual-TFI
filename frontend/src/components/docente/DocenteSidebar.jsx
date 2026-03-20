import React from "react";
import {
  FiHome,
  FiBook,
  FiUsers,
  FiClipboard,
  FiUser,
  FiCheckSquare,
  FiLogOut,
  FiFileText, // nuevo ícono para Materiales
} from "react-icons/fi";

const DocenteSidebar = ({ setSection, section, handleLogout }) => {

  const items = [
    { id: "dashboard", label: "Dashboard", icon: <FiHome /> },
    { id: "cursos", label: "Cursos", icon: <FiBook /> },
    { id: "alumnos", label: "Alumnos", icon: <FiUsers /> },
    { id: "calificaciones", label: "Calificaciones", icon: <FiClipboard /> },
    { id: "asistencias", label: "Asistencia", icon: <FiCheckSquare /> },
    { id: "materiales", label: "Materiales", icon: <FiFileText /> }, // nuevo
    { id: "perfil", label: "Perfil", icon: <FiUser /> },
  ];

  return (
    <div className="docente-sidebar">
      <h2>Docente</h2>

      {items.map(item => (
        <button
          key={item.id}
          className={section === item.id ? "active" : ""}
          onClick={() => setSection(item.id)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}

      {/* Botón de Logout */}
      <button className="logout-btn" onClick={handleLogout}>
        <FiLogOut />
        <span>Cerrar sesión</span>
      </button>

      <style jsx>{`
        .docente-sidebar {
          width: 220px;
          background: #050425;
          color: #fff;
          min-height: 100vh;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        h2 {
          margin-bottom: 20px;
          font-size: 20px;
        }
        button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          margin-bottom: 10px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        button:hover {
          background: rgba(255,255,255,0.15);
        }
        .active {
          background: rgba(255,255,255,0.25);
        }
        .logout-btn {
          margin-top: auto;
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .logout-btn:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
};

export default DocenteSidebar;