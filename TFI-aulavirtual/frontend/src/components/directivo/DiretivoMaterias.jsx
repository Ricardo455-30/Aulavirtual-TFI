import { useState, useEffect } from "react";
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaBook,
  FaPlus,
  FaGraduationCap,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";

import "../../css/DirectivoMaterias.css";

const AdminMaterias = ({ selectedCiclo }) => {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    id_docente: "",
    id_curso: "",
  });

  const [docentes, setDocentes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [materias, setMaterias] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingTabla, setLoadingTabla] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");

  const [pagina, setPagina] = useState(1);
  const porPagina = 5;

  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({ id_docente: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (selectedCiclo) {
      cargarSelects();
      cargarMaterias();
    }
  }, [selectedCiclo]);

  if (!selectedCiclo) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        <FaExclamationCircle size={48} style={{ marginBottom: "16px", opacity: 0.6, color: "#64748b" }} />
        <h3>Selecciona un ciclo lectivo</h3>
        <p>Elige un ciclo lectivo para gestionar las materias.</p>
      </div>
    );
  }

  const cargarSelects = async () => {
    const [docRes, curRes] = await Promise.all([
      fetch("http://localhost:8000/api/docentes", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`http://localhost:8000/api/cursos?id_ciclo=${selectedCiclo || ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    setDocentes(await docRes.json());
    setCursos(await curRes.json());
  };

  const cargarMaterias = async () => {
    setLoadingTabla(true);

    const res = await fetch(
      `http://localhost:8000/api/materias/materias/asignaciones?id_ciclo=${selectedCiclo || ""}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMaterias(await res.json());
    setLoadingTabla(false);
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.id_docente || !form.id_curso) return;

    setLoading(true);
    const cicloId = selectedCiclo ? Number(selectedCiclo) : undefined;

    const resMateria = await fetch("http://localhost:8000/api/materias/materias", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        id_ciclo: cicloId,
      }),
    });

    const dataMateria = await resMateria.json();

    if (!resMateria.ok) {
      setLoading(false);
      return alert(dataMateria.error || "Error al crear la materia");
    }

    const resAsignacion = await fetch("http://localhost:8000/api/materias/asignar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id_docente: form.id_docente,
        id_materia: dataMateria.id_materia,
        id_curso: form.id_curso,
        id_ciclo: cicloId,
      }),
    });

    const dataAsignacion = await resAsignacion.json();

    if (!resAsignacion.ok) {
      setLoading(false);
      return alert(dataAsignacion.error || "Error al asignar la materia al ciclo lectivo");
    }

    setForm({ nombre: "", descripcion: "", id_docente: "",
       id_curso: "" });
    await cargarMaterias();
    setLoading(false);
  };

  // FILTROS
  const materiasFiltradas = materias
    .filter((m) =>
      `${m.materia} ${m.docente_nombre || ""} ${m.curso || ""}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    )
    .filter((m) =>
      filtroCurso ? Number(m.id_curso) === Number(filtroCurso) : true
    );

  // PAGINACIÓN
  const inicio = (pagina - 1) * porPagina;
  const datos = materiasFiltradas.slice(inicio, inicio + porPagina);
  const totalPaginas = Math.ceil(materiasFiltradas.length / porPagina);

  // EDITAR
  const iniciarEdicion = (m) => {
    setEditando(m.id);
    setEditForm({ id_docente: m.id_docente });
  };

  const guardarEdicion = async (id) => {
    await fetch(`http://localhost:8000/api/materias/asignacion/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editForm),
    });

    setEditando(null);
    cargarMaterias();
  };

  return (
    <div className="container">
      <div className="header-section">
        <div className="header-content">
          <div className="header-icon">
            <FaGraduationCap />
          </div>
          <div className="header-text">
            <h1 className="title">Gestión de Materias</h1>
            <p className="subtitle">Crea y administra las materias de tu institución</p>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="card form-card">
        <h2 className="card-title">
          <FaBook /> Nueva Materia
        </h2>
        <div className="form-grid">
          <input
            className="input"
            placeholder="Nombre de la materia"
            value={form.nombre}
            onChange={(e) =>
              setForm({ ...form, nombre: e.target.value })
            }
          />

          <textarea
            className="input textarea"
            placeholder="Descripción (opcional)"
            value={form.descripcion}
            onChange={(e) =>
              setForm({ ...form, descripcion: e.target.value })
            }
          />

          <select
            className="input"
            value={form.id_docente}
            onChange={(e) =>
              setForm({ ...form, id_docente: e.target.value })
            }
          >
            <option value="">Seleccionar Docente</option>
            {docentes.map((d) => (
              <option key={d.id_docente} value={d.id_docente}>
                {d.nombre} {d.apellido}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={form.id_curso}
            onChange={(e) =>
              setForm({ ...form, id_curso: e.target.value })
            }
          >
            <option value="">Seleccionar Curso</option>
            {cursos.map((c) => (
              <option key={c.id_curso} value={c.id_curso}>
                {c.nombre} {c.division}
              </option>
            ))}
          </select>
        </div>

        <button className="button button-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <FaSpinner className="spinner-icon" /> Procesando...
            </>
          ) : (
            <>
              <FaPlus /> Crear Materia
            </>
          )}
        </button>
      </div>

      {/* FILTROS */}
      <div className="card filtros-card">
        <h3 className="filtros-title">Filtros</h3>
        <div className="filtros">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              className="input"
              placeholder="Buscar por materia, docente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={filtroCurso}
            onChange={(e) => setFiltroCurso(e.target.value)}
          >
            <option value="">Todos los cursos</option>
            {cursos.map((c) => (
              <option key={c.id_curso} value={c.id_curso}>
                {c.nombre} {c.division}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="card table-container">
        <h3 className="table-title">Materias Registradas ({materiasFiltradas.length})</h3>
        {loadingTabla ? (
          <div className="loading">
            <FaSpinner className="loading-icon" />
            <p>Cargando materias...</p>
          </div>
        ) : datos.length === 0 ? (
          <div className="empty-state">
            <FaExclamationCircle className="empty-icon" />
            <p>No hay materias registradas</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Docente</th>
                    <th>Curso</th>
                    <th className="actions-col">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {datos.map((m) => (
                    <tr key={m.id}>
                      <td className="materia-cell">
                        <strong>{m.materia}</strong>
                      </td>

                      <td>
                        {editando === m.id ? (
                          <select
                            className="input-edit"
                            value={editForm.id_docente}
                            onChange={(e) =>
                              setEditForm({
                                id_docente: e.target.value,
                              })
                            }
                          >
                            {docentes.map((d) => (
                              <option key={d.id_docente} value={d.id_docente}>
                                {d.nombre} {d.apellido}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="docente-badge">
                            {m.docente_nombre} {m.docente_apellido}
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="curso-badge">
                          {m.curso} {m.division}
                        </span>
                      </td>

                      <td className="actions-cell">
                        {editando === m.id ? (
                          <div className="action-buttons">
                            <button
                              className="btn btn-save"
                              title="Guardar"
                              onClick={() => guardarEdicion(m.id)}
                            >
                              <FaSave />
                            </button>

                            <button
                              className="btn btn-cancel"
                              title="Cancelar"
                              onClick={() => setEditando(null)}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-edit"
                            title="Editar"
                            onClick={() => iniciarEdicion(m)}
                          >
                            <FaEdit />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINACIÓN */}
            <div className="paginacion">
              <button
                className="paginacion-btn"
                disabled={pagina === 1}
                onClick={() => setPagina(pagina - 1)}
              >
                <FaChevronLeft />
              </button>

              <span className="paginacion-info">
                Página {pagina} de {totalPaginas || 1}
              </span>

              <button
                className="paginacion-btn"
                disabled={pagina === totalPaginas || totalPaginas === 0}
                onClick={() => setPagina(pagina + 1)}
              >
                <FaChevronRight />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMaterias;