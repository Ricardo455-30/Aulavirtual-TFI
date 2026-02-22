import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const roles = ["alumno", "docente", "tutor", "directivo", "admin"];

const UsersDirectivo = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [rolActivo, setRolActivo] = useState("alumno");
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // =========================
  // TOKEN
  // =========================
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return null;
    }
    return token;
  };

  // =========================
  // OBTENER USUARIOS
  // =========================
  const obtenerUsuarios = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch("http://localhost:8000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.log("Error status:", res.status);
        setUsuarios([]);
        return;
      }

      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setUsuarios([]);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // =========================
  // GUARDAR
  // =========================
  const handleSave = async () => {
    try {
      const token = getToken();
      if (!token) return;

      // Validaciones
      if (!currentUser.nombre || !currentUser.email) {
        alert("Nombre y email son obligatorios");
        return;
      }

      if (!currentUser.id && !currentUser.contraseña) {
        alert("La contraseña es obligatoria");
        return;
      }

      const method = currentUser.id ? "PUT" : "POST";
      const url = currentUser.id
        ? `http://localhost:8000/api/users/${currentUser.id}`
        : `http://localhost:8000/api/users`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentUser),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Error al guardar");
        return;
      }

      setShowModal(false);
      obtenerUsuarios();
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // CAMBIAR ESTADO
  // =========================
  const cambiarEstado = async (id) => {
    const token = getToken();
    if (!token) return;

    await fetch(`http://localhost:8000/api/users/${id}/estado`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    obtenerUsuarios();
  };

  // =========================
  // FILTROS
  // =========================
  const usuariosFiltrados = usuarios
    .filter((u) => u.rol === rolActivo)
    .filter(
      (u) =>
        u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email?.toLowerCase().includes(busqueda.toLowerCase())
    );

  return (
    <div className="directivo-users">
      <h2>Gestión de Usuarios</h2>

      {/* TABS */}
      <div className="tabs">
        {roles.map((rol) => (
          <button
            key={rol}
            className={rolActivo === rol ? "active" : ""}
            onClick={() => setRolActivo(rol)}
          >
            {rol.toUpperCase()}
          </button>
        ))}
      </div>

      {/* BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* BOTONES */}
      <div className="acciones">
        <button
          onClick={() => {
            setCurrentUser({
              nombre: "",
              apellido: "",
              email: "",
              contraseña: "", // ✅ importante
              rol: rolActivo,
              estado: "Activo",
            });
            setShowModal(true);
          }}
        >
          Nuevo
        </button>
      </div>

      {/* TABLA */}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map((user) => (
            <tr key={user.id}>
              <td>{user.nombre} {user.apellido}</td>
              <td>{user.email}</td>
              <td>{user.estado}</td>
              <td>
                <button
                  onClick={() => {
                    setCurrentUser({ ...user, contraseña: "" });
                    setShowModal(true);
                  }}
                >
                  Editar
                </button>

                <button onClick={() => cambiarEstado(user.id)}>
                  Estado
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="modal">
          <h3>{currentUser.id ? "Editar" : "Registrar"} Usuario</h3>

          <input
            placeholder="Nombre"
            value={currentUser.nombre}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, nombre: e.target.value })
            }
          />

          <input
            placeholder="Apellido"
            value={currentUser.apellido}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, apellido: e.target.value })
            }
          />

          <input
            placeholder="Email"
            value={currentUser.email}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, email: e.target.value })
            }
          />

          {/* PASSWORD SOLO SI ES NUEVO */}
          {!currentUser.id && (
            <input
              type="password"
              placeholder="Contraseña"
              value={currentUser.contraseña}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, contraseña: e.target.value })
              }
            />
          )}

          <button onClick={handleSave}>
            Guardar
          </button>

          <button onClick={() => setShowModal(false)}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersDirectivo;