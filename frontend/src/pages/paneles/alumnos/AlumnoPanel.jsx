import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  Bell,
  MessageCircle,
  BookOpen,
  Home,
  User,
  LogOut,
  ClipboardList,
} from "lucide-react";

import AlumnoDashboard from "../../../components/alumnos/AlumnoDashboard";
import AlumnoMaterias from "../../../components/alumnos/AlumnoMaterias";
import MateriaDetalle from "../../../components/alumnos/MateriaDetalle";
import AlumnoTareas from "../../../components/alumnos/TareasSection";

import logo from "../../../assets/icono.png";
import "../../../css/alumno/alumno.css";

const AlumnoPanel = () => {
  const navigate = useNavigate();
  const [showNoti, setShowNoti] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="alumno-wrapper">
      {/* 🔷 TOPBAR */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo-container" onClick={() => navigate("/alumno/dashboard")}>
            <img src={logo} alt="logo" className="logo-img" />
            <span className="logo-text">Aula Virtual</span>
          </div>

          <button onClick={() => navigate("/alumno/dashboard")}>
            <Home size={18} /> Inicio
          </button>

          <button onClick={() => navigate("/alumno/materias")}>
            <BookOpen size={18} /> Materias
          </button>

          <button onClick={() => navigate("/alumno/tareas")}>
            <ClipboardList size={18} /> Tareas
          </button>
        </div>

        <div className="topbar-right">
          {/* 🔔 NOTIFICACIONES */}
          <div
            className="icon-container"
            onClick={() => setShowNoti(!showNoti)}
          >
            <Bell size={20} />
            <span className="badge">3</span>

            {showNoti && (
              <div className="dropdown">
                <p>📌 Nueva tarea subida</p>
                <p>📅 Fecha de parcial modificada</p>
                <p>💬 Mensaje del docente</p>
              </div>
            )}
          </div>

          {/* 💬 CHAT */}
          <div
            className="icon-container"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageCircle size={20} />
          </div>

          {/* 👤 PERFIL */}
          <div className="profile-pic">
            <User size={20} />
          </div>

          {/* 🚪 LOGOUT */}
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </header>

      {/* 🔷 CONTENIDO */}
      <main className="alumno-content">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AlumnoDashboard />} />
          <Route path="materias" element={<AlumnoMaterias />} />
          <Route path="materias/:id" element={<MateriaDetalle />} />
          <Route path="tareas" element={<AlumnoTareas />} />
        </Routes>
      </main>

      {/* 💬 CHAT LATERAL */}
      <div className={`chat-panel ${showChat ? "open" : ""}`}>
        <div className="chat-header">
          <h3>Chat</h3>
          <button onClick={() => setShowChat(false)}>✖</button>
        </div>

        <div className="chat-body">
          <p>👨‍🎓 Amigo 1</p>
          <p>👩‍🎓 Amigo 2</p>
          <p>👨‍🏫 Docente</p>
        </div>

        <div className="chat-footer">
          <input type="text" placeholder="Escribe un mensaje..." />
        </div>
      </div>
    </div>
  );
};

export default AlumnoPanel;