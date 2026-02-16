import React, { useState } from "react";

const UserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState(user);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{formData.id ? "Editar" : "Nuevo"} Usuario</h3>

        <input
          type="text"
          placeholder="Nombre"
          value={formData.name}
          onChange={e =>
            setFormData({ ...formData, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={e =>
            setFormData({ ...formData, email: e.target.value })
          }
        />

        {!formData.id && (
          <input
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={e =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        )}

        <select
          value={formData.role}
          onChange={e =>
            setFormData({ ...formData, role: e.target.value })
          }
        >
          <option>Alumno</option>
          <option>Docente</option>
          <option>Admin</option>
        </select>

        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button className="save-btn" onClick={() => onSave(formData)}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
