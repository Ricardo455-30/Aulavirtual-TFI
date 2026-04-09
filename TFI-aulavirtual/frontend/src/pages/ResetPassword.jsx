import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import "../css/resetPassword.css";
import logo from "../assets/icono.png"; // <-- tu logo aquí

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const validarPassword = (pass) => {
    return pass.length >= 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!validarPassword(password)) {
      setError(true);
      setMensaje("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError(true);
      setMensaje("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8000/api/auth/reset/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nuevaPassword: password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(true);
        setMensaje(data.message);
      } else {
        setError(false);
        setMensaje("✅ Contraseña actualizada correctamente");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setError(true);
      setMensaje("Error del servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <img src={logo} alt="Logo" className="reset-logo" />

        <h2>Restablecer contraseña</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FiLock className="icon" />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="eye"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <div className="input-group">
            <FiLock className="icon" />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Actualizando..." : "Cambiar contraseña"}
          </button>
        </form>

        {mensaje && (
          <p className={`mensaje ${error ? "error" : "success"}`}>
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;