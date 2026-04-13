import { useState } from "react";
import { FiDownload, FiUpload, FiTrash2, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import "../../css/SettingsSection.css";

const SettingsSection = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleBackup = async () => {
    try {
      setLoading(true);
      const data = {
        users: JSON.parse(localStorage.getItem("admin_users")) || [],
        logs: JSON.parse(localStorage.getItem("login_logs")) || [],
        timestamp: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_admin_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showToast("Backup descargado correctamente", "success");
    } catch (error) {
      showToast("Error al descargar el backup", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        localStorage.setItem("admin_users", JSON.stringify(data.users || []));
        localStorage.setItem("login_logs", JSON.stringify(data.logs || []));

        showToast("Backup restaurado correctamente", "success");
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        showToast("Archivo inválido o corrupto", "error");
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      showToast("Error al leer el archivo", "error");
      setLoading(false);
    };
    
    reader.readAsText(file);
  };

  const handleClearData = () => {
    const confirmDelete = window.confirm(
      "⚠️ ADVERTENCIA: Esto eliminará TODOS los datos almacenados. Esta acción no se puede deshacer. ¿Continuar?"
    );
    
    if (confirmDelete) {
      try {
        localStorage.removeItem("admin_users");
        localStorage.removeItem("login_logs");
        showToast("Datos eliminados correctamente", "success");
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        showToast("Error al eliminar datos", "error");
      }
    }
  };

  return (
    <div className="settings-section">
      {/* TOAST NOTIFICATIONS */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}

      {/* HEADER */}
      <div className="settings-header">
        <div className="settings-title-group">
          <h2>⚙️ Configuración del Sistema</h2>
          <p>Gestiona copias de seguridad y datos</p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="settings-content">
        {/* CARDS GRID */}
        <div className="settings-grid">

          {/* BACKUP CARD */}
          <div className="settings-card backup">
            <div className="card-header">
              <div className="card-icon backup">
                <FiDownload />
              </div>
              <h3>Descargar Backup</h3>
            </div>
            <p className="card-description">
              Exporta todos los datos en formato JSON con timestamp
            </p>
            <button 
              onClick={handleBackup} 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Procesando..." : "Descargar Ahora"}
            </button>
          </div>

          {/* RESTORE CARD */}
          <div className="settings-card restore">
            <div className="card-header">
              <div className="card-icon restore">
                <FiUpload />
              </div>
              <h3>Restaurar Backup</h3>
            </div>
            <p className="card-description">
              Importa datos desde un archivo JSON válido
            </p>
            <label className="btn btn-primary">
              {loading ? "Importando..." : "Elegir Archivo"}
              <input
                type="file"
                accept=".json"
                onChange={handleRestore}
                disabled={loading}
                hidden
              />
            </label>
          </div>

          {/* DELETE CARD */}
          <div className="settings-card danger">
            <div className="card-header">
              <div className="card-icon danger">
                <FiTrash2 />
              </div>
              <h3>Limpiar Información</h3>
            </div>
            <p className="card-description">
              ⚠️ Borra TODA la información en cache. No se puede deshacer
            </p>
            <button 
              onClick={handleClearData} 
              className="btn btn-danger"
              disabled={loading}
            >
              {loading ? "Procesando..." : "Limpiar Datos"}
            </button>
          </div>

        </div>

        {/* INFO BOX */}
        <div className="settings-info">
          <div className="info-icon">ℹ️</div>
          <div className="info-content">
            <h4>Información Importante</h4>
            <ul>
              <li>Los backups incluyen usuarios y registros de acceso</li>
              <li>Se recomienda hacer backup mensual</li>
              <li>Verifica que los archivos JSON sean válidos antes de restaurar</li>
              <li>La limpieza de datos es irreversible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;