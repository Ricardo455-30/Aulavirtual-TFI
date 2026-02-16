import React from "react";
import "../CSS/LandingPage.css";

const Footer = () => {
  return (
    <footer className="footer">

      

      <p className="footer-legal">
        Este sistema cumple con la Ley 11.723 de Propiedad Intelectual (Argentina)
        y respeta la Ley 25.326 de Protección de Datos Personales.
      </p>

      <p className="footer-copy">
        © {new Date().getFullYear()} – Todos los derechos reservados a
        <strong>
          {" "}
          Barraza Canto Amparo, Corbalán Ricardo,  Morales Juan y Ana Paula Liberatore.
        </strong>
      </p>
    </footer>
  );
};

export default Footer;
