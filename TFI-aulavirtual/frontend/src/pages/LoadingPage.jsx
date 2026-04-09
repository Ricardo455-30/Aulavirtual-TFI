import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/loading.css";
import logo from "../assets/logoblanco.png";

const messages = [
  "Iniciando sesión...",
  "Sincronizando contenidos...",
  "Preparando tu aula...",
];

const LoadingPage = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    // Si no hay usuario guardado → volver al login
    if (!usuario) {
      navigate("/login");
      return;
    }

    // Normalizamos el rol para evitar errores de mayúsculas/minúsculas
    const role = usuario.rol?.toLowerCase();

    const textInterval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 900);

    const timer = setTimeout(() => {
      setFadeOut(true);

      setTimeout(() => {
        switch (role) {
          case "superadmin":
          case "superadmin":
            navigate("/admin");
            break;

          case "docente":
            navigate("/docente");
            break;

          case "alumno":
            navigate("/alumno");
            break;

          case "directivo":
            navigate("/directivo");
            break;

          default:
            console.log("Rol no reconocido:", role);
            navigate("/login");
        }
      }, 600);
    }, 2600);

    return () => {
      clearInterval(textInterval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className={`loading-orbit ${fadeOut ? "fade-out" : ""}`}>
      <div className="orbit-wrapper">
        <div className="orbit orbit-1" />
        <div className="orbit orbit-2" />

        <img src={logo} alt="Logo" className="orbit-logo" />
      </div>

      <p className="orbit-text">{messages[index]}</p>
    </div>
  );
};

export default LoadingPage;