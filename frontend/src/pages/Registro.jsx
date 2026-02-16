import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield } from "react-icons/fa";
import { FiMail, FiLock, FiUser, FiPhone, FiClipboard, FiAward } from "react-icons/fi";
import "../css/registro.css";

const Registro = () => {
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

  useEffect(() => {
    setMostrarClave(form.rol === "docente" || form.rol === "tutor");
  }, [form.rol]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["legajo", "dni", "fecha_nacimiento", "titulo", "especialidad", "telefono"].includes(name)) {
      setForm({ ...form, datosEspecificos: { ...form.datosEspecificos, [name]: value } });
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

  const handleSubmit = (e) => {
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
      contraseña: form.password,
      rol: form.rol,
      clave_autorizacion: form.claveRol,
      datos_especificos: form.datosEspecificos
    };

    console.log("Registro listo:", registroJSON);
    alert("Formulario listo ✔️ (después lo conectamos al backend)");
  };

  return (
    <div className="registro-container">
      <form className="registro-card" onSubmit={handleSubmit}>
        <h2>Crear cuenta</h2>
        <p>Completa tus datos para registrarte</p>

        {/* Campos comunes */}
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
          {errores.nombre && <span className="error">{errores.nombre}</span>}
        </div>

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
          {errores.apellido && <span className="error">{errores.apellido}</span>}
        </div>

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
          {errores.email && <span className="error">{errores.email}</span>}
        </div>

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
          {errores.password && <span className="error">{errores.password}</span>}
        </div>

        {/* Selección de rol */}
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
              <FiUser className="input-icon" />
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
              <FiUser className="input-icon" />
              <input
                type="date"
                name="fecha_nacimiento"
                placeholder="Fecha de nacimiento"
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
                  <FiClipboard className="input-icon" />
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

            {mostrarClave && (
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
            )}
          </div>
        )}

        <button type="submit">Registrarse</button>

        <p className="login-link">
          ¿Ya tenés cuenta?
          <Link to="/login"> Iniciar sesión</Link>
        </p>
      </form>
    </div>
  );
};

export default Registro;
