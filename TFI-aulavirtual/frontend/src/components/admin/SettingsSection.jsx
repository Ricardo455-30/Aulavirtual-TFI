import { FiDownload, FiUpload, FiTrash2 } from "react-icons/fi";

const ConfigSection = () => {

  const handleBackup = () => {
    const data = {
      users: JSON.parse(localStorage.getItem("admin_users")) || [],
      logs: JSON.parse(localStorage.getItem("login_logs")) || [],
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup_admin.json";
    a.click();
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        localStorage.setItem("admin_users", JSON.stringify(data.users || []));
        localStorage.setItem("login_logs", JSON.stringify(data.logs || []));

        alert("Backup restaurado correctamente");
        window.location.reload();
      } catch (error) {
        alert("Archivo inválido");
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm("¿Seguro que deseas eliminar todos los datos?")) {
      localStorage.removeItem("admin_users");
      localStorage.removeItem("login_logs");
      alert("Datos eliminados correctamente");
      window.location.reload();
    }
  };

  return (
    <div className="config-section">

      {/* HEADER */}
      <div className="config-header">
        <h2>Configuración del Sistema</h2>
        <p>Gestiona copias de seguridad y datos del sistema</p>
      </div>

      {/* CARDS */}
      <div className="config-grid">

        {/* BACKUP */}
        <div className="config-card">
          <div className="config-icon">
            <FiDownload />
          </div>
          <h3>Descargar Backup</h3>
          <p>Exporta todos los datos en formato JSON</p>
          <button onClick={handleBackup} className="btn primary">
            Descargar
          </button>
        </div>

        {/* RESTORE */}
        <div className="config-card">
          <div className="config-icon">
            <FiUpload />
          </div>
          <h3>Restaurar Backup</h3>
          <p>Importa datos desde un archivo</p>

          <label className="btn primary">
            Restaurar
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              hidden
            />
          </label>
        </div>

        {/* DELETE */}
        <div className="config-card danger">
          <div className="config-icon danger">
            <FiTrash2 />
          </div>
          <h3>Limpiar información</h3>
          <p>Borra toda la información almacenada en memoria cache</p>
          <button onClick={handleClearData} className="btn danger">
            Limpiar
          </button>
        </div>

      </div>

    </div>
  );
};

export default ConfigSection;