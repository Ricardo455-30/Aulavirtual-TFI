import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import Modal from "../components/Modal";
import "../CSS/LandingPage.css";
import logo from "../assets/logoblanco.png";

import { FiBook, FiUser, FiUsers } from "react-icons/fi";
import {
  MdSecurity,
  MdDevices,
  MdSpeed,
  MdSupportAgent,
} from "react-icons/md";

const LandingPage = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const counters = document.querySelectorAll(".stat-card h3");

    counters.forEach((counter) => {
      const target = +counter.getAttribute("data-target");
      let count = 0;

      const update = () => {
        const increment = target / 80;
        count += increment;

        if (count < target) {
          counter.innerText = Math.ceil(count);
          requestAnimationFrame(update);
        } else {
          counter.innerText =
            target + (target === 100 ? "%" : "+");
        }
      };

      update();
    });
  }, []);

  return (
    <div className="landing-container no-select">
      {/* HEADER */}
      <header className="landing-header">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo-img" />
          <h1 className="logo-text">Aula Virtual</h1>
        </div>

        <div className="header-buttons">
          <button
            className="header-btn ghost"
            onClick={() => navigate("/registro")}
          >
            Registro
          </button>

          <button
            className="header-btn primary"
            onClick={() => navigate("/login")}
          >
            Iniciar sesión
          </button>
        </div>
      </header>

      {/* HERO */}
      <Hero />

      {/* STATS */}
      <section className="stats-pro">
        <div className="stat-card">
          <h3 data-target="500">0</h3>
          <p>Estudiantes</p>
        </div>

        <div className="stat-card">
          <h3 data-target="40">0</h3>
          <p>Docentes</p>
        </div>

        <div className="stat-card">
          <h3 data-target="100">0</h3>
          <p>Acceso Digital</p>
        </div>
      </section>

      {/* ROLES */}
      <section className="roles-section">
        <h2>¿Quiénes pueden usar la plataforma?</h2>

        <div className="roles-grid">
          <div className="role-card">
            <div className="role-icon alumnos">
              <FiBook />
            </div>
            <h3>Alumnos</h3>
            <p>
              Accedé a tus materias, actividades,
              comunicados y contenidos desde cualquier
              dispositivo.
            </p>
          </div>

          <div className="role-card">
            <div className="role-icon docentes">
              <FiUser />
            </div>
            <h3>Docentes</h3>
            <p>
              Gestioná cursos, materiales, tareas y
              comunicación con tus estudiantes de forma
              simple.
            </p>
          </div>

          <div className="role-card">
            <div className="role-icon familias">
              <FiUsers />
            </div>
            <h3>Familias</h3>
            <p>
              Seguimiento académico, comunicados
              institucionales y acceso seguro a la
              información.
            </p>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="how-section" id="how-section">
        <h2>¿Cómo funciona?</h2>

        <div className="how-steps">
          <div className="how-step">
            <span>1</span>
            <h3>Creá tu cuenta</h3>
            <p>
              Registrate según tu rol y accedé
              a la plataforma.
            </p>
          </div>

          <div className="how-step">
            <span>2</span>
            <h3>Ingresá al aula</h3>
            <p>
              Visualizá cursos, comunicados,
              tareas y materiales educativos.
            </p>
          </div>

          <div className="how-step">
            <span>3</span>
            <h3>Participá y seguí</h3>
            <p>
              Interactuá, entregá actividades
              y seguí el progreso académico.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="benefits-section">
        <h2>¿Por qué elegir nuestra plataforma?</h2>

        <p className="benefits-subtitle">
          Tecnología pensada para simplificar
          la gestión educativa
        </p>

        <div className="benefits-grid">
          <div className="benefit-card">
            <MdSecurity className="benefit-icon" />
            <h3>Seguridad</h3>
            <p>
              Datos protegidos, accesos por rol y
              privacidad garantizada para toda la
              comunidad.
            </p>
          </div>

          <div className="benefit-card">
            <MdDevices className="benefit-icon" />
            <h3>Multidispositivo</h3>
            <p>
              Accedé desde celular, tablet o
              computadora sin perder funcionalidades.
            </p>
          </div>

          <div className="benefit-card">
            <MdSpeed className="benefit-icon" />
            <h3>Rápida y simple</h3>
            <p>
              Interfaz intuitiva para que docentes
              y alumnos la usen sin complicaciones.
            </p>
          </div>

          <div className="benefit-card">
            <MdSupportAgent className="benefit-icon" />
            <h3>Acompañamiento</h3>
            <p>
              Soporte y mejoras continuas pensadas
              junto a las instituciones.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
