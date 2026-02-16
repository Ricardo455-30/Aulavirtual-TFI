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
      const data = JSON.parse(event.target.result);

      localStorage.setItem("admin_users", JSON.stringify(data.users));
      localStorage.setItem("login_logs", JSON.stringify(data.logs));

      alert("Backup restaurado correctamente 🚀");
      window.location.reload();
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm("¿Seguro que deseas eliminar todos los datos?")) {
      localStorage.removeItem("admin_users");
      localStorage.removeItem("login_logs");
      alert("Datos eliminados correctamente ❌");
      window.location.reload();
    }
  };

  return (
    <div className="config-section">
      <h2>⚙ Configuración del Sistema</h2>

      <div className="config-buttons">

        <button
          onClick={handleBackup}
          className="admin-btn btn-primary"
        >
          <FiDownload /> Descargar Backup
        </button>

        <label className="admin-btn btn-success">
          <FiUpload /> Restaurar Backup
          <input
            type="file"
            accept=".json"
            onChange={handleRestore}
            hidden
          />
        </label>

        <button
          onClick={handleClearData}
          className="admin-btn btn-danger"
        >
          <FiTrash2 /> Eliminar Datos
        </button>

      </div>
    </div>
  );
};

export default ConfigSection;
