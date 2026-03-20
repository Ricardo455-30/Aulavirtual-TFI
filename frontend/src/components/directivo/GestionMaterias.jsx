import { useEffect, useState } from "react";
import axios from "axios";

const GestionMaterias = () => {

  const [materias, setMaterias] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);

  const [nombre, setNombre] = useState("");
  const [carga, setCarga] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState(null);

  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [docenteSeleccionado, setDocenteSeleccionado] = useState("");

  const [estadoFiltro, setEstadoFiltro] = useState("todas");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editando, setEditando] = useState(null);

  const token = localStorage.getItem("token");
  const BASE_URL = "http://localhost:8000/api";

  const headers = {
    Authorization: `Bearer ${token}`
  };

  // ==========================
  // CARGAR
  // ==========================
  const cargarTodo = async () => {
    try {
      const [m, c, d] = await Promise.all([
        axios.get(`${BASE_URL}/materias?page=${page}&estado=${estadoFiltro}`, { headers }),
        axios.get(`${BASE_URL}/cursos`, { headers }),
        axios.get(`${BASE_URL}/docentes`, { headers }),
      ]);

      console.log("DATA BACK:", m.data);

      const data = m.data.data || [];

      // 🔥 NORMALIZACIÓN DEL ESTADO (FIX CLAVE)
      const normalizadas = data.map(mat => ({
        ...mat,
        estado: (mat.estado || "").trim().toLowerCase()
      }));

      setMaterias(normalizadas);
      setTotalPages(m.data.totalPages || 1);
      setCursos(c.data);
      setDocentes(d.data);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, [page, estadoFiltro]);

  // ==========================
  // CREAR
  // ==========================
  const crearMateria = async () => {
    if (!nombre || !carga) return;

    try {
      const formData = new FormData();
      formData.append("nombre_materia", nombre);
      formData.append("carga_horaria", carga);
      formData.append("descripcion", descripcion);
      if (foto) formData.append("foto", foto);

      const res = await axios.post(`${BASE_URL}/materias`, formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data"
        }
      });

      const idMateria = res.data.id;

      await axios.post(`${BASE_URL}/materias/${idMateria}/asignar`, {
        id_docente: docenteSeleccionado,
        id_curso: cursoSeleccionado
      }, { headers });

      setNombre("");
      setCarga("");
      setDescripcion("");
      setFoto(null);

      cargarTodo();

    } catch (error) {
      console.error(error);
    }
  };

  // ==========================
  // CAMBIAR ESTADO
  // ==========================
  const cambiarEstado = async (id, estadoActual) => {
    try {
      const nuevoEstado = estadoActual === "activa" ? "inactiva" : "activa";

      await axios.put(
        `${BASE_URL}/materias/${id}/estado`,
        { estado: nuevoEstado },
        { headers }
      );

      cargarTodo();

    } catch (error) {
      console.error(error);
    }
  };

  // ==========================
  // EDITAR
  // ==========================
  const guardarEdicion = async () => {
    try {
      const formData = new FormData();
      formData.append("nombre_materia", editando.nombre_materia);
      formData.append("carga_horaria", editando.carga_horaria);
      formData.append("descripcion", editando.descripcion);

      if (editando.foto) {
        formData.append("foto", editando.foto);
      }

      await axios.put(
        `${BASE_URL}/materias/${editando.id_materia}`,
        formData,
        {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setEditando(null);
      cargarTodo();

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="section-container">

      {/* HEADER */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Gestión de Materias</h2>
          <p className="section-subtitle">Administrá materias</p>
        </div>

        <select
          className="search-input"
          value={estadoFiltro}
          onChange={(e) => {
            setEstadoFiltro(e.target.value);
            setPage(1);
          }}
        >
          <option value="todas">Todas</option>
          <option value="activa">Activas</option>
          <option value="inactiva">Inactivas</option>
        </select>
      </div>

      {/* FORM */}
      <div className="form-inline">
        <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
        <input type="number" placeholder="Carga" value={carga} onChange={e => setCarga(e.target.value)} />
        <input placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
        <input type="file" onChange={e => setFoto(e.target.files[0])} />

        <select value={cursoSeleccionado} onChange={e => setCursoSeleccionado(e.target.value)}>
          <option value="">Curso</option>
          {cursos.map(c => (
            <option key={c.id_curso} value={c.id_curso}>
              {c.anio}° {c.division}
            </option>
          ))}
        </select>

        <select value={docenteSeleccionado} onChange={e => setDocenteSeleccionado(e.target.value)}>
          <option value="">Docente</option>
          {docentes.map(d => (
            <option key={d.id_docente} value={d.id_docente}>
              {d.nombre} {d.apellido}
            </option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={crearMateria}>
          Crear
        </button>
      </div>

      {/* TABLA */}
      <table className="tabla-pro">
        <thead>
          <tr>
            <th>Materia</th>
            <th>Curso</th>
            <th>Docente</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {materias.map(m => (
            <tr key={m.id_materia}>
              <td>{m.nombre_materia}</td>
              <td>{m.anio ? `${m.anio}° ${m.division}` : "-"}</td>
              <td>{m.docente || "-"}</td>

              <td>
                <span className={`badge ${m.estado === "activa" ? "badge-activa" : "badge-inactiva"}`}>
                  {m.estado || "sin estado"}
                </span>
              </td>

              <td>
                <button
                  className="btn btn-primary"
                  onClick={() => cambiarEstado(m.id_materia, m.estado)}
                >
                  {m.estado === "activa" ? "Desactivar" : "Activar"}
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => setEditando(m)}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINACIÓN */}
      <div className="pagination-pro">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Anterior
        </button>

        <span className="page-info">
          Página {page} de {totalPages}
        </span>

        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Siguiente
        </button>
      </div>

      {/* MODAL */}
      {editando && (
        <div className="modal-overlay">
          <div className="modal">

            <h3>Editar Materia</h3>

            <input
              value={editando.nombre_materia}
              onChange={e => setEditando({ ...editando, nombre_materia: e.target.value })}
            />

            <input
              type="number"
              value={editando.carga_horaria}
              onChange={e => setEditando({ ...editando, carga_horaria: e.target.value })}
            />

            <input
              value={editando.descripcion}
              onChange={e => setEditando({ ...editando, descripcion: e.target.value })}
            />

            <div className="acciones">
              <button className="btn btn-primary" onClick={guardarEdicion}>
                Guardar
              </button>

              <button className="btn btn-secondary" onClick={() => setEditando(null)}>
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default GestionMaterias;