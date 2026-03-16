import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { logout } from "../services/logout";

const AutoLogout = () => {
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const decoded = jwtDecode(token);

      const expirationTime = decoded.exp * 1000; // convertir a milisegundos
      const currentTime = Date.now();
      const timeLeft = expirationTime - currentTime;

      if (timeLeft <= 0) {
        logout();
      } else {
        const timer = setTimeout(() => {
          alert("Tu sesión ha expirado por seguridad.");
          logout();
        }, timeLeft);

        return () => clearTimeout(timer);
      }

    } catch (error) {
      logout();
    }
  }, []);

  return null;
};

export default AutoLogout;