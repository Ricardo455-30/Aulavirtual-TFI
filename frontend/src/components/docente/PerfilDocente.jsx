import React, { useEffect, useState } from "react";
import { getPerfilDocente } from "../../services/services";

const PerfilDocente = () => {
  const [docente, setDocente] = useState(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const data = await getPerfilDocente();
      setDocente(data);
    } catch (error) {
      console.error("Error al cargar perfil", error);
    }
  };

  if (!docente) return <p>Cargando perfil...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.header}>
          <div style={styles.avatar}>
            {docente.nombre?.charAt(0) || "?"}
          </div>

          <div>
            <h2 style={styles.nombre}>
              {docente.nombre || ""} {docente.apellido || ""}
            </h2>

            <p style={styles.titulo}>
              {docente.titulo || "Docente"}
            </p>
          </div>
        </div>

        <div style={styles.infoContainer}>

          <div style={styles.infoBox}>
            <span style={styles.label}>Especialidad</span>
            <span style={styles.value}>
              {docente.especialidad || "No especificada"}
            </span>
          </div>

          <div style={styles.infoBox}>
            <span style={styles.label}>Rol</span>
            <span style={styles.value}>
              Docente
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    marginTop: 40
  },
  card: {
    width: "420px",
    background: "white",
    borderRadius: "14px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px"
  },
  avatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "#4a6cf7",
    color: "white",
    fontSize: "28px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  nombre: {
    margin: 0,
    fontSize: "22px"
  },
  titulo: {
    margin: 0,
    opacity: 0.7
  },
  infoContainer: {
    display: "grid",
    gap: "15px"
  },
  infoBox: {
    border: "1px solid #eee",
    borderRadius: "10px",
    padding: "15px",
    display: "flex",
    justifyContent: "space-between"
  },
  label: {
    fontWeight: "bold",
    opacity: 0.7
  },
  value: {
    fontWeight: "500"
  }
};

export default PerfilDocente;