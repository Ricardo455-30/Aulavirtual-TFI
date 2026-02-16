import React, { useMemo, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Dashboard = ({ users = [], loginLogs = [] }) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  /* ===============================
     MÉTRICAS LOGIN
  =============================== */
  const loginsToday = loginLogs.filter(
    (log) => log.date === todayStr
  ).length;

  const loginsMonth = loginLogs.filter((log) => {
    const d = new Date(log.date);
    return (
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  }).length;

  const loginsYear = loginLogs.filter((log) => {
    const d = new Date(log.date);
    return d.getFullYear() === today.getFullYear();
  }).length;

  /* ===============================
     ROLES COUNT
  =============================== */
  const rolesCount = useMemo(() => {
    return {
      Docente: users.filter((u) => u.role === "Docente").length,
      Alumno: users.filter((u) => u.role === "Alumno").length,
      Admin: users.filter((u) => u.role === "Admin").length,
    };
  }, [users]);

  /* ===============================
     DATA GRÁFICOS
  =============================== */
  const barData = useMemo(
    () => ({
      labels: ["Docentes", "Alumnos", "Admins"],
      datasets: [
        {
          label: "Usuarios por rol",
          data: [
            rolesCount.Docente,
            rolesCount.Alumno,
            rolesCount.Admin,
          ],
          backgroundColor: ["#4e73df", "#1cc88a", "#e74a3b"],
          borderRadius: 8,
        },
      ],
    }),
    [rolesCount]
  );

  const doughnutData = useMemo(
    () => ({
      labels: ["Docentes", "Alumnos", "Admins"],
      datasets: [
        {
          data: [
            rolesCount.Docente,
            rolesCount.Alumno,
            rolesCount.Admin,
          ],
          backgroundColor: ["#4e73df", "#1cc88a", "#e74a3b"],
        },
      ],
    }),
    [rolesCount]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
  };

  /* ===============================
     MENSAJERÍA
  =============================== */
  const [selectedTarget, setSelectedTarget] = useState("Todos");
  const [messageText, setMessageText] = useState("");

  const [notifications, setNotifications] = useState(
    JSON.parse(localStorage.getItem("notifications")) || []
  );

  const handleSend = (type) => {
    if (!messageText.trim()) {
      alert("Escribí un mensaje");
      return;
    }

    const payload = {
      id: Date.now(),
      type,
      target: selectedTarget,
      content: messageText,
      date: new Date().toISOString(),
    };

    const storageKey =
      type === "mensaje" ? "messages" : "notifications";

    const existing =
      JSON.parse(localStorage.getItem(storageKey)) || [];

    existing.push(payload);

    localStorage.setItem(storageKey, JSON.stringify(existing));

    if (type === "notificacion") {
      setNotifications(existing);
    }

    alert(
      `${type === "mensaje" ? "Mensaje" : "Notificación"} enviada ✔`
    );

    setMessageText("");
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem(
      "notifications",
      JSON.stringify(updated)
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("notifications");
  };

  return (
    <>
      <h2>Dashboard</h2>

      {/* ===============================
          STATS
      =============================== */}
      <div className="stats-top">
        <div className="stat-box">
          <h4>Inicios Hoy</h4>
          <p>{loginsToday}</p>
        </div>

        <div className="stat-box">
          <h4>Este Mes</h4>
          <p>{loginsMonth}</p>
        </div>

        <div className="stat-box">
          <h4>Este Año</h4>
          <p>{loginsYear}</p>
        </div>
      </div>

      {/* ===============================
          CHARTS
      =============================== */}
      <div className="charts-grid">
        <div className="chart-card">
          <Bar data={barData} options={chartOptions} />
        </div>

        <div className="chart-card">
          <Doughnut data={doughnutData} options={chartOptions} />
        </div>
      </div>

      {/* ===============================
          PANEL ENVÍO
      =============================== */}
      <div className="message-panel">
        <h3>Enviar Mensaje / Notificación</h3>

        <select
          value={selectedTarget}
          onChange={(e) =>
            setSelectedTarget(e.target.value)
          }
        >
          <option value="Todos">Todos</option>
          <option value="Docente">Docentes</option>
          <option value="Alumno">Alumnos</option>
          <option value="Admin">Admins</option>
        </select>

        <textarea
          placeholder="Escribí el mensaje..."
          value={messageText}
          onChange={(e) =>
            setMessageText(e.target.value)
          }
        />

        <div className="buttons-row">
          <button
            className="btn-primary"
            onClick={() => handleSend("mensaje")}
          >
            Enviar Mensaje
          </button>

          <button
            className="btn-warning"
            onClick={() => handleSend("notificacion")}
          >
            Enviar Notificación
          </button>
        </div>
      </div>

      {/* ===============================
          HISTORIAL
      =============================== */}
      <div className="history-panel">
        <h3>Historial de Notificaciones</h3>

        {notifications.length === 0 ? (
          <p className="empty-text">
            No hay notificaciones enviadas
          </p>
        ) : (
          notifications
            .slice()
            .reverse()
            .map((n) => (
              <div
                key={n.id}
                className="notification-item"
              >
                <div className="notification-header">
                  <span className="target-badge">
                    {n.target}
                  </span>
                  <span className="date-text">
                    {new Date(
                      n.date
                    ).toLocaleString()}
                  </span>
                </div>

                <p className="notification-content">
                  {n.content}
                </p>

                <button
                  className="btn-delete"
                  onClick={() =>
                    deleteNotification(n.id)
                  }
                >
                  Eliminar
                </button>
              </div>
            ))
        )}

        {notifications.length > 0 && (
          <button
            className="btn-clear"
            onClick={clearNotifications}
          >
            Limpiar Historial
          </button>
        )}
      </div>
    </>
  );
};

export default Dashboard;
