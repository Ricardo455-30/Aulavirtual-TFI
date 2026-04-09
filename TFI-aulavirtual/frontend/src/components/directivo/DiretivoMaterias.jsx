import { useState, useEffect } from "react";
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import "../../css/DirectivoMaterias.css";

const AdminMaterias = () => {
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
    cargarSelects();
    cargarMaterias();
  }, []);

  const cargarSelects = async () => {
    const [docRes, curRes] = await Promise.all([
      fetch("http://localhost:8000/api/docentes", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost:8000/api/cursos", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    setDocentes(await docRes.json());
    setCursos(await curRes.json());
  };

  const cargarMaterias = async () => {
    setLoadingTabla(true);

    const res = await fetch(
      "http://localhost:8000/api/materias/materias/asignaciones",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMaterias(await res.json());
    setLoadingTabla(false);
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.id_docente || !form.id_curso) return;

    setLoading(true);

    const resMateria = await fetch("http://localhost:8000/api/materias/materias", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const dataMateria = await resMateria.json();

    await fetch("http://localhost:8000/api/materias/materias/asignar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id_docente: form.id_docente,
        id_materia: dataMateria.id_materia,
        id_curso: form.id_curso,
      }),
    });

    setForm({ nombre: "", descripcion: "", id_docente: "", id_curso: "" });
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
      <h1 className="title">Gestión de Materias</h1>

      {/* FORM */}
      <div className="card">
        <input
          className="input"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) =>
            setForm({ ...form, nombre: e.target.value })
          }
        />

        <textarea
          className="input"
          placeholder="Descripción"
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
          <option value="">Docente</option>
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
          <option value="">Curso</option>
          {cursos.map((c) => (
            <option key={c.id_curso} value={c.id_curso}>
              {c.nombre} {c.division}
            </option>
          ))}
        </select>

        <button className="button" onClick={handleSubmit}>
          {loading ? "Procesando..." : "Crear"}
        </button>
      </div>

      {/* FILTROS */}
      <div className="filtros">
        <div style={{ position: "relative", flex: 1 }}>
          <FaSearch style={{ position: "absolute", top: 14, left: 10 }} />
          <input
            className="input"
            style={{ paddingLeft: "35px" }}
            placeholder="Buscar..."
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

      {/* TABLA */}
      <div className="card table-container">
        {loadingTabla ? (
          <p>Cargando...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Docente</th>
                <th>Curso</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {datos.map((m) => (
                <tr key={m.id}>
                  <td>{m.materia}</td>

                  <td>
                    {editando === m.id ? (
                      <select
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
                      `${m.docente_nombre} ${m.docente_apellido}`
                    )}
                  </td>

                  <td>
                    {m.curso} {m.division}
                  </td>

                  <td>
                    {editando === m.id ? (
                      <>
                        <button
                          className="btn btn-save"
                          onClick={() => guardarEdicion(m.id)}
                        >
                          <FaSave />
                        </button>

                        <button
                          className="btn btn-cancel"
                          onClick={() => setEditando(null)}
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-edit"
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
        )}

        {/* PAGINACIÓN */}
        <div className="paginacion">
          <button
            disabled={pagina === 1}
            onClick={() => setPagina(pagina - 1)}
          >
            <FaChevronLeft />
          </button>

          <span>
            {pagina} / {totalPaginas || 1}
          </span>

          <button
            disabled={pagina === totalPaginas || totalPaginas === 0}
            onClick={() => setPagina(pagina + 1)}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminMaterias;