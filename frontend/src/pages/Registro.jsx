import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield } from "react-icons/fa";
import { FiMail, FiLock, FiUser, FiPhone, FiClipboard, FiAward } from "react-icons/fi";
import "../css/registro.css";

const Registro = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    rol: "alumno",
    claveRol: "",
    datosEspecificos: {}
  });

  const [errores, setErrores] = useState({});
  const [mostrarClave, setMostrarClave] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMostrarClave(form.rol === "docente" || form.rol === "tutor");
  }, [form.rol]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["legajo", "dni", "fecha_nacimiento", "titulo", "especialidad", "telefono"].includes(name)) {
      setForm({
        ...form,
        datosEspecificos: {
          ...form.datosEspecificos,
          [name]: value
        }
      });
    } else {
      setForm({ ...form, [name]: value });
    }

    if (!value) {
      setErrores({ ...errores, [name]: "Este campo es obligatorio" });
    } else {
      const newErrores = { ...errores };
      delete newErrores[name];
      setErrores(newErrores);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if ((form.rol === "docente" || form.rol === "tutor") && !form.claveRol) {
      alert("Debes ingresar la clave de autorización para tu rol");
      return;
    }

    const camposObligatorios = ["nombre", "apellido", "email", "password"];
    let vacios = camposObligatorios.filter((c) => !form[c]);

    if (vacios.length > 0) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    const registroJSON = {
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      password: form.password,
      rol: form.rol,
      claveRol: form.claveRol,
      datosEspecificos: form.datosEspecificos
    };

    try {
      setLoading(true);

      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registroJSON)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar usuario");
      }

      alert("Usuario registrado correctamente ✔️");

      // Redirige al login
      navigate("/login");

    } catch (error) {
      console.error("Error en registro:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <form className="registro-card" onSubmit={handleSubmit}>
        <h2>Crear cuenta</h2>
        <p>Completa tus datos para registrarte</p>

        {/* Nombre */}
        <div className="input-group">
          <FiUser className="input-icon" />
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        {/* Apellido */}
        <div className="input-group">
          <FiUser className="input-icon" />
          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={form.apellido}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div className="input-group">
          <FiMail className="input-icon" />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}
        <div className="input-group">
          <FiLock className="input-icon" />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* Roles */}
        <div className="roles">
          <label>
            <input
              type="radio"
              name="rol"
              value="alumno"
              checked={form.rol === "alumno"}
              onChange={handleChange}
            />
            <FaUserGraduate /> Alumno
          </label>

          <label>
            <input
              type="radio"
              name="rol"
              value="docente"
              checked={form.rol === "docente"}
              onChange={handleChange}
            />
            <FaChalkboardTeacher /> Docente
          </label>

          <label>
            <input
              type="radio"
              name="rol"
              value="tutor"
              checked={form.rol === "tutor"}
              onChange={handleChange}
            />
            <FaUserShield /> Tutor
          </label>
        </div>

        {/* Campos específicos */}
        {form.rol === "alumno" && (
          <div className="animacion-suave">
            <div className="input-group">
              <FiClipboard className="input-icon" />
              <input
                type="text"
                name="legajo"
                placeholder="Legajo"
                value={form.datosEspecificos.legajo || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="text"
                name="dni"
                placeholder="DNI"
                value={form.datosEspecificos.dni || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="date"
                name="fecha_nacimiento"
                value={form.datosEspecificos.fecha_nacimiento || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        )}

        {(form.rol === "docente" || form.rol === "tutor") && (
          <div className="animacion-suave">
            {form.rol === "docente" && (
              <>
                <div className="input-group">
                  <FiAward className="input-icon" />
                  <input
                    type="text"
                    name="titulo"
                    placeholder="Título"
                    value={form.datosEspecificos.titulo || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    name="especialidad"
                    placeholder="Especialidad"
                    value={form.datosEspecificos.especialidad || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            {form.rol === "tutor" && (
              <div className="input-group">
                <FiPhone className="input-icon" />
                <input
                  type="text"
                  name="telefono"
                  placeholder="Teléfono"
                  value={form.datosEspecificos.telefono || ""}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                type="password"
                name="claveRol"
                placeholder="Clave de autorización"
                value={form.claveRol}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        <p className="login-link">
          ¿Ya tenés cuenta?
          <Link to="/login"> Iniciar sesión</Link>
        </p>
      </form>
    </div>
  );
};

export default Registro;
