import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import { FiMail, FiLock, FiUser, FiClipboard, FiAward, FiUpload, FiX } from "react-icons/fi";
import "../css/registro.css";

const Registro = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    rol: "alumno",
    datosEspecificos: {
      legajo: "",
      especialidad: "",
      titulo: ""
    }
  });

  const [archivos, setArchivos] = useState({ dni: null, perfil: null });
  const [preview, setPreview] = useState({ dni: null, perfil: null });
  const [nombresArchivos, setNombresArchivos] = useState({ dni: "", perfil: "" });
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  // Manejo de inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["legajo", "especialidad", "titulo"].includes(name)) {
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
  };

  // Manejo de archivos
  const handleFile = (file, type) => {
    if (!file) return;

    setArchivos(prev => ({ ...prev, [type]: file }));
    setNombresArchivos(prev => ({ ...prev, [type]: file.name }));

    if (file.type.startsWith("image/")) {
      setPreview(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
    } else if (file.type === "application/pdf") {
      setPreview(prev => ({ ...prev, [type]: "pdf" }));
    }
  };

  const removeFile = (type) => {
    setArchivos(prev => ({ ...prev, [type]: null }));
    setPreview(prev => ({ ...prev, [type]: null }));
    setNombresArchivos(prev => ({ ...prev, [type]: "" }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0], type);
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!archivos.dni || !archivos.perfil) {
      alert("Debes subir DNI y foto de perfil");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("nombre", form.nombre);
      formData.append("apellido", form.apellido);
      formData.append("email", form.email);
      formData.append("password", form.password);

      const id_rol = form.rol === "docente" ? 3 : 4;
      formData.append("id_rol", id_rol);

      // Campos específicos
      if (form.rol === "alumno") {
        formData.append("legajo", form.datosEspecificos.legajo);
      }
      if (form.rol === "docente") {
        formData.append("especialidad", form.datosEspecificos.especialidad);
        formData.append("titulo", form.datosEspecificos.titulo);
      }

      formData.append("dni", archivos.dni);
      formData.append("perfil", archivos.perfil);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:8000/api/auth/registro");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        setLoading(false);
        if (xhr.status === 201 || xhr.status === 200) {
          alert("Registro exitoso ✔️");
          navigate("/login");
        } else {
          console.error(xhr.responseText);
          alert("Error al registrar");
        }
      };

      xhr.onerror = () => {
        setLoading(false);
        alert("Error de conexión con el servidor");
      };

      xhr.send(formData);
    } catch (error) {
      console.error(error);
      alert("Error al enviar el formulario");
      setLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <form className="registro-card" onSubmit={handleSubmit}>
        <h2>Crear cuenta</h2>
        <p>Completa tus datos</p>

        <div className="input-group">
          <FiUser className="input-icon" />
          <input name="nombre" placeholder="Nombre" onChange={handleChange} required />
        </div>

        <div className="input-group">
          <FiUser className="input-icon" />
          <input name="apellido" placeholder="Apellido" onChange={handleChange} required />
        </div>

        <div className="input-group">
          <FiMail className="input-icon" />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        </div>

        <div className="input-group">
          <FiLock className="input-icon" />
          <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />
        </div>

        <div className="roles">
          <label>
            <input type="radio" name="rol" value="alumno" checked={form.rol === "alumno"} onChange={handleChange} />
            <FaUserGraduate /> Alumno
          </label>
          <label>
            <input type="radio" name="rol" value="docente" checked={form.rol === "docente"} onChange={handleChange} />
            <FaChalkboardTeacher /> Docente
          </label>
        </div>

        {/* Campos específicos */}
        {form.rol === "alumno" && (
          <div className="input-group">
            <FiClipboard className="input-icon" />
            <input name="legajo" placeholder="Legajo" onChange={handleChange} required />
          </div>
        )}

        {form.rol === "docente" && (
          <>
            <div className="input-group">
              <FiAward className="input-icon" />
              <input name="especialidad" placeholder="Especialidad" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <FiClipboard className="input-icon" />
              <input name="titulo" placeholder="Título" onChange={handleChange} required />
            </div>
          </>
        )}

        {/* DNI */}
        <div className="dropzone" onDrop={(e) => handleDrop(e, "dni")} onDragOver={(e) => e.preventDefault()}>
          <FiUpload />
          <p>DNI (imagen o PDF)</p>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFile(e.target.files[0], "dni")} />
          {nombresArchivos.dni && <small>{nombresArchivos.dni}</small>}
          {preview.dni && (preview.dni === "pdf" ? <div className="pdf-preview">📄 PDF cargado</div> : <img src={preview.dni} alt="dni" />)}
          {archivos.dni && <FiX onClick={() => removeFile("dni")} />}
        </div>

        {/* PERFIL */}
        <div className="dropzone" onDrop={(e) => handleDrop(e, "perfil")} onDragOver={(e) => e.preventDefault()}>
          <FiUpload />
          <p>Foto de perfil</p>
          <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0], "perfil")} />
          {nombresArchivos.perfil && <small>{nombresArchivos.perfil}</small>}
          {preview.perfil && <img src={preview.perfil} alt="perfil" />}
          {archivos.perfil && <FiX onClick={() => removeFile("perfil")} />}
        </div>

        {loading && (
          <div className="progress-bar">
            <div style={{ width: `${progress}%` }}></div>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? `Subiendo ${progress}%` : "Registrarse"}
        </button>

        <p className="login-link">
          ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </form>
    </div>
  );
};

export default Registro;