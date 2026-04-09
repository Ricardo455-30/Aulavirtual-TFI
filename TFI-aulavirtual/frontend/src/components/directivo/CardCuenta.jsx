import React, { useState } from "react";
import AvatarCircle from "./AvatarCircle";

const RolTag = ({ rol }) => {
  let color = "#e0e7ef";
  let text = "#64748b";

  if (rol?.toLowerCase().includes("docente")) {
    color = "#fef3c7"; text = "#d97706";
  } else if (rol?.toLowerCase().includes("capacitador")) {
    color = "#e0f2fe"; text = "#0369a1";
  }

  return (
    <span style={{
      background: color,
      color: text,
      borderRadius: 8,
      fontSize: 12,
      padding: "3px 10px",
      fontWeight: 500
    }}>{rol}</span>
  );
};

const CardCuenta = ({ cuenta, onAprobar, onRechazar, disabled, modo = "pendiente" }) => {
  const [openModal, setOpenModal] = useState(false);
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(false);

  const nombreCompleto = [cuenta?.NOMBRE, cuenta?.APELLIDO].filter(Boolean).join(" ");
  const archivosCompletos = cuenta.archivos_subidos >= 2;

  const abrirArchivo = (ruta) => {
    window.open(`http://localhost:8000/${ruta.replace(/\\/g, "/")}`, "_blank");
  };

  const abrirModal = async () => {
    setOpenModal(true);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/auth/archivos/${cuenta.id}`);
      const data = await res.json();
      setArchivos(data);
    } catch (err) {
      console.error("Error al cargar archivos:", err);
      setArchivos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={styles.card}>
        <AvatarCircle name={nombreCompleto} />
        <div style={{ flex: 1 }}>
          <div style={styles.nombre}>{nombreCompleto}</div>
          <div style={styles.email}>{cuenta.EMAIL}</div>
          <div style={{ marginTop: 4 }}><RolTag rol={cuenta.ROL} /></div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: archivosCompletos ? "#16a34a" : "#dc2626"
          }}>{cuenta.archivos_subidos}/2</div>

          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            {(modo === "pendiente" || modo === "aprobado" || modo === "rechazado") && (
              <button style={styles.btnSecondary} onClick={abrirModal}>👁 Ver</button>
            )}

            {modo === "pendiente" && (
              <>
                <button style={{
                  ...styles.btnPrimary,
                  opacity: archivosCompletos && !disabled ? 1 : 0.6,
                  cursor: archivosCompletos && !disabled ? "pointer" : "not-allowed"
                }} onClick={onAprobar} disabled={!archivosCompletos || disabled}>✔ Aprobar</button>

                <button style={{
                  ...styles.btnDanger,
                  opacity: disabled ? 0.6 : 1,
                  cursor: disabled ? "not-allowed" : "pointer"
                }} onClick={onRechazar} disabled={disabled}>✖ Rechazar</button>
              </>
            )}

            {modo === "aprobado" && (
              <button style={styles.btnDanger} onClick={onRechazar}>✖ Rechazar</button>
            )}

            {modo === "rechazado" && (
              <button style={styles.btnPrimary} onClick={onAprobar}>✔ Aprobar</button>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {openModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>📂 Archivos de {nombreCompleto}</h3>
            {loading ? (
              <p>Cargando archivos...</p>
            ) : archivos.length > 0 ? (
              archivos.map((a) => (
                <div key={a.id_archivo} style={styles.fileRow}>
                  <strong>{a.nombre}:</strong>
                  <span style={styles.link} onClick={() => abrirArchivo(a.ruta)}>Ver archivo</span>
                </div>
              ))
            ) : (
              <p style={{ color: "#999" }}>No hay archivos disponibles</p>
            )}
            <button style={styles.closeBtn} onClick={() => setOpenModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  card: { background: "#fff", borderRadius: 16, padding: "1.2rem", display: "flex", alignItems: "center", gap: 18, marginBottom: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" },
  nombre: { fontWeight: 700 },
  email: { fontSize: 13, color: "#64748b" },
  btnPrimary: { padding: "6px 12px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" },
  btnDanger: { padding: "6px 12px", borderRadius: 6, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer" },
  btnSecondary: { padding: "6px 12px", borderRadius: 6, border: "none", background: "#6b7280", color: "#fff", cursor: "pointer" },
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999 },
  modal: { background: "#fff", padding: "1.5rem", borderRadius: 12, width: "400px", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" },
  fileRow: { display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 },
  link: { color: "#2563eb", cursor: "pointer", textDecoration: "underline" },
  closeBtn: { marginTop: 15, width: "100%", padding: "8px", border: "none", borderRadius: 8, background: "#ef4444", color: "#fff", cursor: "pointer" }
};

export default CardCuenta;