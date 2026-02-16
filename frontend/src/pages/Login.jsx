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

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorLogin, setErrorLogin] = useState("");

  // Modal recuperar contraseña
  const [modalRecuperar, setModalRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [errorRecuperar, setErrorRecuperar] = useState("");
  const [successRecuperar, setSuccessRecuperar] = useState("");

  // ==============================
  // LOGIN
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLogin("");

    if (!captcha) {
      setErrorLogin("Por favor confirma el captcha");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          contraseña: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorLogin(data.message || "Credenciales incorrectas");
        return;
      }

      // 🔐 Guardar sesión
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      localStorage.setItem("userRole", data.usuario.rol);

      // 🚀 Ir a pantalla de carga
      navigate("/loading");

    } catch (error) {
      setErrorLogin("Error de conexión con el servidor");
    }
  };

  // ==============================
  // RECUPERAR CONTRASEÑA (Simulado)
  // ==============================
  const handleRecuperar = (e) => {
    e.preventDefault();
    setErrorRecuperar("");
    setSuccessRecuperar("");

    if (!emailRecuperar) {
      setErrorRecuperar("Por favor ingresa tu correo");
      return;
    }

    const token = Math.random().toString(36).substring(2, 12);

    setSuccessRecuperar(
      `Se envió un link de recuperación a ${emailRecuperar}. Token simulado: ${token}`
    );

    setEmailRecuperar("");
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="logo-box">
          <img src="/src/assets/icono.png" alt="Aula Virtual" />
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
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
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

      {/* ==============================
          MODAL RECUPERAR
      ============================== */}
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
            <p>Ingresa tu correo para enviar el link de recuperación:</p>

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

              {errorRecuperar && (
                <span className="error">{errorRecuperar}</span>
              )}

              {successRecuperar && (
                <span className="success">{successRecuperar}</span>
              )}

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
