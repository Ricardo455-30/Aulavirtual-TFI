import { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  Bell,
  MessageCircle,
  BookOpen,
  Home,
  User,
  LogOut,
  ClipboardList,
} from "lucide-react";

import AlumnoDashboard from "../../components/alumnos/AlumnoDashboard";
import AlumnoMaterias from "../../components/alumnos/AlumnoMaterias";
import MateriaDetalle from "../../components/alumnos/MateriaDetalle";
import AlumnoTareas from "../../components/alumnos/TareasSection";

import logo from "../../assets/logoblanco.png";
import "../../css/alumno/alumno.css";

const AlumnoPanel = () => {
  const navigate = useNavigate();
  const [showNoti, setShowNoti] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const userId = usuario?.id;

  const apiUrl = "http://localhost:8000";

  const apiFetch = useCallback(
    async (path, options = {}) => {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      };
      const response = await fetch(`${apiUrl}${path}`, { ...options, headers });
      return response;
    },
    [token]
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiFetch("/api/mensajes/unread");
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.unreadCount ?? 0);
    } catch (err) {
      console.error("Error fetching unread count", err);
    }
  }, [apiFetch, token]);

  const fetchContacts = useCallback(async () => {
    if (!token) return;
    try {
      const [contactsRes, docentesRes] = await Promise.all([
        apiFetch("/api/mensajes/contactos"),
        apiFetch("/api/docentes/public"),
      ]);

      if (!contactsRes.ok || !docentesRes.ok) return;

      const [contactosData, docentesData] = await Promise.all([
        contactsRes.json(),
        docentesRes.json(),
      ]);

      // Unión de contactos y docentes (sin duplicados)
      const merged = [
        ...contactosData,
        ...docentesData.filter(
          (docente) => !contactosData.some((c) => c.id === docente.id)
        ),
      ];

      setContacts(merged);
    } catch (err) {
      console.error("Error fetching contacts", err);
    }
  }, [apiFetch, token]);

  const fetchMessagesFor = useCallback(
    async (contact) => {
      if (!token || !contact) return;
      setLoadingMessages(true);
      try {
        const res = await apiFetch(`/api/mensajes?id_otro=${contact.id}`);
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data);
        await fetchUnreadCount();
      } catch (err) {
        console.error("Error fetching messages", err);
      } finally {
        setLoadingMessages(false);
      }
    },
    [apiFetch, fetchUnreadCount, token]
  );

  useEffect(() => {
    fetchUnreadCount();
    fetchContacts();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [fetchContacts, fetchUnreadCount]);

  useEffect(() => {
    if (showChat && contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  }, [showChat, contacts, selectedContact]);

  useEffect(() => {
    if (selectedContact) fetchMessagesFor(selectedContact);
  }, [selectedContact, fetchMessagesFor]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const onSelectContact = (contact) => {
    setSelectedContact(contact);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedContact) return;
    setSending(true);
    try {
      const res = await apiFetch("/api/mensajes", {
        method: "POST",
        body: JSON.stringify({
          id_receptor: selectedContact.id,
          asunto: "Mensaje desde chat",
          contenido: messageText.trim(),
        }),
      });

      if (res.ok) {
        setMessageText("");
        await fetchMessagesFor(selectedContact);
      } else {
        console.error("Send message failed", await res.text());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="alumno-wrapper">
      {/* 🔷 TOPBAR */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo-container" onClick={() => navigate("/alumno/dashboard")}>
            <img src={logo} alt="logo" className="logo-img" />
            <span className="logo-text whitespace-nowrap">Aula Virtual</span> 
          </div>

          <button onClick={() => navigate("/alumno/dashboard")}>
            <Home size={18} /> Inicio
          </button>

          <button onClick={() => navigate("/alumno/materias")}>
            <BookOpen size={18} /> Materias
          </button>

          <button onClick={() => navigate("/alumno/tareas")}>
            <ClipboardList size={18} /> Tareas
          </button>
        </div>

        <div className="topbar-right">
          {/* 🔔 NOTIFICACIONES */}
          <div
            className="icon-container"
            onClick={() => setShowNoti(!showNoti)}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}

            {showNoti && (
              <div className="dropdown">
                <p>📩 Tienes {unreadCount} mensajes sin leer</p>
                <p>💬 Abre el chat para leerlos</p>
              </div>
            )}
          </div>

          {/* 💬 CHAT */}
          <div
            className="icon-container"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageCircle size={20} />
          </div>

          {/* 👤 PERFIL */}
          <div className="profile-pic">
            <User size={20} />
          </div>

          {/* 🚪 LOGOUT */}
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </header>

      {/* 🔷 CONTENIDO */}
      <main className="alumno-content">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AlumnoDashboard />} />
          <Route path="materias" element={<AlumnoMaterias />} />
          <Route path="materias/:id" element={<MateriaDetalle />} />
          <Route path="tareas" element={<AlumnoTareas />} />
        </Routes>
      </main>

      {/* 💬 CHAT LATERAL */}
      <div className={`chat-panel ${showChat ? "open" : ""}`}>
        <div className="chat-header">
          <h3>
            Chat{selectedContact ? ` con ${selectedContact.nombre} ${selectedContact.apellido}` : ""}
          </h3>
          <button onClick={() => setShowChat(false)}>✖</button>
        </div>

        <div className="chat-body">
          <div className="chat-contacts">
            <h4>Contactos</h4>
            {contacts.length === 0 && (
              <p className="empty">No hay contactos todavía. Envía un mensaje y se agregará aquí.</p>
            )}
            {contacts.map((contact) => (
              <button
                key={contact.id}
                className={`contact-item ${selectedContact?.id === contact.id ? "active" : ""}`}
                onClick={() => onSelectContact(contact)}
              >
                {contact.nombre} {contact.apellido}
              </button>
            ))}
          </div>

          <div className="chat-conversation">
            {selectedContact ? (
              <>
                <div className="messages">
                  {loadingMessages ? (
                    <p className="loading">Cargando mensajes...</p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id_mensaje}
                        className={`message ${msg.id_emisor === userId ? "sent" : "received"}`}
                      >
                        <div className="message-content">{msg.contenido}</div>
                        <div className="message-meta">
                          {msg.id_emisor === userId ? "Tú" : selectedContact.nombre} · {new Date(msg.fecha_envio).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="chat-footer">
                  <input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje..."
                  />
                  <button onClick={handleSendMessage} disabled={sending || !messageText.trim()}>
                    Enviar
                  </button>
                </div>
              </>
            ) : (
              <p className="empty">Selecciona un contacto para chatear</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumnoPanel;