import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLogIn,
} from "react-icons/fi";
import "../css/login.css";
import logo from "../assets/icono.png";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorLogin, setErrorLogin] = useState("");

  const [modalRecuperar, setModalRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [errorRecuperar, setErrorRecuperar] = useState("");
  const [successRecuperar, setSuccessRecuperar] = useState("");

  // ================= LOGIN =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLogin("");

    if (!captcha) {
      setErrorLogin("Por favor confirma el captcha");
      return;
    }

    // Validar solo Gmail, Hotmail o Outlook
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook)\.com$/i;
    if (!emailRegex.test(email)) {
      setErrorLogin("Solo se permiten correos Gmail, Hotmail o Outlook");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password, // 🔹 Cambiado de "contraseña" a "password"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorLogin(data.message || "Credenciales incorrectas");
        return;
      }

      // Guardar token y usuario
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      localStorage.setItem("userRole", data.usuario.rol_id);

      navigate("/loading");

    } catch (error) {
      setErrorLogin("Error de conexión con el servidor");
    }
  };

  // ================= RECUPERAR =================
  const handleRecuperar = async (e) => {
    e.preventDefault();
    setErrorRecuperar("");
    setSuccessRecuperar("");

    if (!emailRecuperar) {
      setErrorRecuperar("Por favor ingresa tu correo");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook)\.com$/i;
    if (!emailRegex.test(emailRecuperar)) {
      setErrorRecuperar("Solo se permiten correos Gmail, Hotmail o Outlook");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/recuperar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailRecuperar }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorRecuperar(data.message || "Error al enviar el correo");
        return;
      }

      setSuccessRecuperar("Correo enviado correctamente 📩");
      setEmailRecuperar("");

      setTimeout(() => {
        setModalRecuperar(false);
        setSuccessRecuperar("");
      }, 3000);

    } catch (error) {
      setErrorRecuperar("Error de conexión con el servidor");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* LOGO */}
        <div className="logo-box">
          <Link to="/" className="logo-link">
            <img src={logo} alt="Aula Virtual" />
          </Link>
        </div>

        <h2>Bienvenido</h2>
        <p className="subtitle">Ingresá a tu aula virtual</p>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <FiMail className="input-icon" />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <div className="captcha-wrapper">
            <ReCAPTCHA
              sitekey="6LcIcPErAAAAAEItNKo6udqJR4WpWmoa8xiBt1mD"
              onChange={(value) => setCaptcha(value)}
            />
          </div>

          {errorLogin && <p className="error">{errorLogin}</p>}

          <button className="login-btn">
            <FiLogIn /> Ingresar
          </button>

        </form>

        <div className="login-links">
          <span
            className="text-link"
            onClick={() => setModalRecuperar(true)}
          >
            ¿Olvidaste tu contraseña?
          </span>

          <span className="registro-text">
            ¿No tenés cuenta?
            <Link to="/registro" className="text-link">
              Registrate
            </Link>
          </span>
        </div>
      </div>

      {/* MODAL RECUPERAR */}
      {modalRecuperar && (
        <div
          className="modal-overlay"
          onClick={() => setModalRecuperar(false)}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Recuperar contraseña</h3>

            <form onSubmit={handleRecuperar}>

              <div className="input-group">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={emailRecuperar}
                  onChange={(e) => setEmailRecuperar(e.target.value)}
                  required
                />
              </div>

              {errorRecuperar && <span className="error">{errorRecuperar}</span>}
              {successRecuperar && <span className="success">{successRecuperar}</span>}

              <button type="submit">Enviar</button>
              <button
                type="button"
                className="close-btn"
                onClick={() => setModalRecuperar(false)}
              >
                Cancelar
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;