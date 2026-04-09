import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/hero.css";
import imagen from "../assets/img.png";

const Hero = () => {
  const navigate = useNavigate();
  const [animating, setAnimating] = useState(false);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLearnMore = () => {
    setAnimating(true);

    setTimeout(() => {
      const section = document.getElementById("how-section");
      section?.scrollIntoView({ behavior: "smooth" });

      setTimeout(() => setAnimating(false), 600);
    }, 200);
  };

  return (
    <section className="hero-pro">
      {/* TEXTO */}
      <div className="hero-pro-content">
        <span className="hero-badge">Plataforma Educativa</span>

        <h1>
          Construí el futuro
          <br />
          <span>con educación digital</span>
        </h1>

        <p>
          Aula Virtual de la Escuela Juan Gregorio de Jesús Díaz.
          Accedé a contenidos, comunicación y gestión educativa
          desde cualquier dispositivo.
        </p>

        <div className="hero-pro-actions">
          <button className="btn-primary" onClick={handleLogin}>
            Ingresar
          </button>

          <button
            className={`btn-outline ${animating ? "pulse" : ""}`}
            onClick={handleLearnMore}
            disabled={animating}
          >
            Conocer más
          </button>
        </div>
      </div>

      {/* IMAGEN */}
      <div className="hero-pro-image">
        <img src={imagen} alt="Plataforma educativa" />
      </div>
    </section>
  );
};

export default Hero;
