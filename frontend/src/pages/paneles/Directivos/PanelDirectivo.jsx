import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  Users,
  GraduationCap,
  UserCheck,
  LogOut
} from "lucide-react";

import DirectivoDashboard from "../../../components/directivo/DirectivoDashboard";
import GestionMaterias from "../../../components/directivo/GestionMaterias";
import GestionUsuarios from "../../../components/directivo/GestionUsuarios";

import logo from "../../../assets/icono.png";
import "../../../css/directivo/panelDirectivo.css";

const DirectivoPanel = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="directivo-wrapper">

      {/* 🔷 TOPBAR */}
      <header className="directivo-topbar">

        <div className="topbar-left">
          <div className="logo-container" onClick={() => navigate("/directivo")}>
            <img src={logo} alt="logo" />
            <span>Aula Virtual</span>
          </div>

          <button onClick={() => navigate("/directivo")}>
            <Home size={18} /> Inicio
          </button>

          <button onClick={() => navigate("/directivo/materias")}>
            <BookOpen size={18} /> Materias
          </button>

          <button onClick={() => navigate("/directivo/docentes")}>
            <UserCheck size={18} /> Docentes
          </button>

          <button onClick={() => navigate("/directivo/alumnos")}>
            <GraduationCap size={18} /> Alumnos
          </button>

          <button onClick={() => navigate("/directivo/tutores")}>
            <Users size={18} /> Tutores
          </button>
        </div>

        <div className="topbar-right">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Salir
          </button>
        </div>

      </header>

      {/* 🔷 CONTENIDO */}
      <main className="directivo-content">
        <Routes>
          <Route path="/" element={<DirectivoDashboard />} />
          <Route path="materias" element={<GestionMaterias />} />
          <Route path="docentes" element={<GestionUsuarios rol="docente" />} />
          <Route path="alumnos" element={<GestionUsuarios rol="alumno" />} />
          <Route path="tutores" element={<GestionUsuarios rol="tutor" />} />
          <Route path="*" element={<Navigate to="" />} />
        </Routes>
      </main>

    </div>
  );
};

export default DirectivoPanel;