import React, { useEffect, useMemo, useState } from "react";
import { getCursos } from "../../services/cursos.services"; // ajustá la ruta

const AlumnosSection = () => {
  const [cursos, setCursos] = useState([]);            // ✅ ahora viene del backend
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [errorCursos, setErrorCursos] = useState("");

  // (por ahora alumnos queda igual / vacío, después lo conectamos)
  const [alumnos] = useState([]);

  const cargarCursos = async () => {
    setLoadingCursos(true);
    setErrorCursos("");
    try {
      const data = await getCursos();

      // Normalizo lo que venga del backend al formato que usa la card
      // 👇 id: clave única, curso: "1° A", sub: "Turno mañana"
      const normalizados = data.map((c) => ({
        id: c.id_curso ?? c.id ?? c.ID_CURSO, // cubro variaciones comunes
        curso: `${c.anio}° ${c.division}`,
        sub: `Turno ${c.turno}`,
        raw: c, // por si luego querés usar anio/division/turno sin recalcular
      }));

      setCursos(normalizados);
    } catch (e) {
      setErrorCursos(e.message || "No se pudieron cargar los cursos.");
    } finally {
      setLoadingCursos(false);
    }
  };

  useEffect(() => {
    cargarCursos();
  }, []);

  const cursoInfo = useMemo(
    () => cursos.find((c) => c.id === cursoSeleccionado),
    [cursos, cursoSeleccionado]
  );

  // cuando integremos alumnos, filtraremos por cursoSeleccionado
  const alumnosFiltrados = useMemo(() => {
    if (!cursoSeleccionado) return [];
    return alumnos.filter((a) => a.id_curso === cursoSeleccionado);
  }, [alumnos, cursoSeleccionado]);

  return (
    <div>
      <h2>Alumnos</h2>

      {/* ESTADO CURSOS */}
      {loadingCursos && <p>Cargando cursos...</p>}
      {errorCursos && <p style={{ color: "crimson" }}>{errorCursos}</p>}

      {/* CARDS DE CURSOS */}
      {!loadingCursos && !errorCursos && (
        <div style={styles.grid}>
          {cursos.map((c) => {
            const active = c.id === cursoSeleccionado;

            return (
              <button
                key={c.id}
                onClick={() => setCursoSeleccionado(c.id)}
                style={{ ...styles.card, ...(active ? styles.cardActive : {}) }}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardLabel}>Curso</span>
                  <span style={styles.badge}>{c.id}</span>
                </div>

                <div style={styles.cardCurso}>{c.curso}</div>

                <div style={styles.cardSub}>{c.sub}</div>

                <div style={styles.cardHint}>Ver alumnos →</div>
              </button>
            );
          })}
        </div>
      )}

      {/* DETALLE (por ahora: solo muestra el curso seleccionado) */}
      <div style={{ marginTop: 16 }}>
        {!cursoSeleccionado ? (
          <div style={styles.emptyBox}>
            Seleccioná un curso para mostrar la tabla.
          </div>
        ) : (
          <>
            <div style={styles.detailHeader}>
              <div>
                <h3 style={{ margin: 0 }}>Curso {cursoInfo?.curso}</h3>
                <small style={{ opacity: 0.75 }}>
                  {/* Después lo reemplazamos por la cantidad real desde alumnos */}
                  Inscriptos (demo): <b>{alumnosFiltrados.length}</b>
                </small>
              </div>

              <button
                style={styles.backBtn}
                onClick={() => setCursoSeleccionado(null)}
              >
                ← Volver
              </button>
            </div>

            {/* Acá luego va la tabla real de alumnos */}
            <div style={styles.emptyBox}>
              (Siguiente paso) Tabla de alumnos del curso seleccionado.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
    marginTop: 12,
  },
  card: {
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 12,
    padding: 12,
    background: "white",
    cursor: "pointer",
    textAlign: "left",
  },
  cardActive: {
    border: "1px solid rgba(0,0,0,0.28)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    transform: "translateY(-1px)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 12,
    opacity: 0.7,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  cardCurso: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.1,
  },
  cardSub: {
    marginTop: 6,
    opacity: 0.75,
    fontSize: 13,
  },
  cardHint: {
    marginTop: 10,
    fontSize: 13,
    opacity: 0.8,
  },
  badge: {
    fontSize: 12,
    padding: "3px 8px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.15)",
    opacity: 0.8,
  },
  emptyBox: {
    border: "1px dashed rgba(0,0,0,0.25)",
    borderRadius: 12,
    padding: 16,
    opacity: 0.8,
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  backBtn: {
    border: "1px solid rgba(0,0,0,0.15)",
    borderRadius: 10,
    padding: "8px 10px",
    background: "white",
    cursor: "pointer",
  },
};

export default AlumnosSection;