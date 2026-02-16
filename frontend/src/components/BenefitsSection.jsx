import {
  MdSecurity,
  MdDevices,
  MdSpeed,
  MdSupportAgent,
} from "react-icons/md";
import "../CSS/BenefitsSection.css";

const BenefitsSection = () => {
  return (
    <section className="benefits-section">
      <h2>¿Por qué elegir nuestra plataforma?</h2>
      <p className="benefits-subtitle">
        Tecnología pensada para simplificar la gestión educativa
      </p>

      <div className="benefits-grid">
        <div className="benefit-card">
          <MdSecurity className="benefit-icon" />
          <h3>Seguridad</h3>
          <p>
            Datos protegidos, accesos por rol y privacidad garantizada
            para toda la comunidad.
          </p>
        </div>

        <div className="benefit-card">
          <MdDevices className="benefit-icon" />
          <h3>Multidispositivo</h3>
          <p>
            Accedé desde celular, tablet o computadora sin perder
            funcionalidades.
          </p>
        </div>

        <div className="benefit-card">
          <MdSpeed className="benefit-icon" />
          <h3>Rápida y simple</h3>
          <p>
            Interfaz intuitiva para que docentes y alumnos la usen sin
            complicaciones.
          </p>
        </div>

        <div className="benefit-card">
          <MdSupportAgent className="benefit-icon" />
          <h3>Acompañamiento</h3>
          <p>
            Soporte y mejoras continuas pensadas junto a las
            instituciones.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
