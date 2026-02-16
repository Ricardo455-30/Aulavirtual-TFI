import React, { useState } from "react";
import { FiPlus, FiEdit, FiTrash, FiLock } from "react-icons/fi";
import UserModal from "./UserModal";

const Users = ({ users, setUsers }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleSave = user => {
    if (user.id) {
      setUsers(users.map(u => (u.id === user.id ? user : u)));
    } else {
      setUsers([
        ...users,
        {
          ...user,
          id: Date.now(),
          password: user.password || "123456",
          status: "Activo",
        },
      ]);
    }
    setShowModal(false);
  };

  const handleDelete = id => {
    setUsers(users.filter(u => u.id !== id));
  };

  const toggleStatus = id => {
    setUsers(
      users.map(user =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Activo" ? "Inactivo" : "Activo",
            }
          : user
      )
    );
  };

  const changePassword = id => {
    const newPass = prompt("Ingrese nueva contraseña:");
    if (!newPass) return;

    setUsers(
      users.map(user =>
        user.id === id ? { ...user, password: newPass } : user
      )
    );

    alert("Contraseña actualizada");
  };

  return (
    <>
      <div className="users-header">
        <h2>Usuarios</h2>
        <button
          className="add-btn"
          onClick={() => {
            setCurrentUser({
              name: "",
              email: "",
              role: "Alumno",
              password: "",
              status: "Activo",
            });
            setShowModal(true);
          }}
        >
          <FiPlus /> Nuevo
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>

              <td>
                <span
                  className={`status-badge ${
                    user.status === "Activo"
                      ? "active"
                      : "inactive"
                  }`}
                >
                  {user.status}
                </span>
              </td>

              <td>
                <FiEdit
                  className="icon-btn"
                  onClick={() => {
                    setCurrentUser(user);
                    setShowModal(true);
                  }}
                />

                <FiLock
                  className="icon-btn"
                  onClick={() => changePassword(user.id)}
                  title="Cambiar contraseña"
                />

                <FiTrash
                  className="icon-btn delete"
                  onClick={() => handleDelete(user.id)}
                />

                <button
                  className="toggle-btn"
                  onClick={() => toggleStatus(user.id)}
                >
                  {user.status === "Activo"
                    ? "Desactivar"
                    : "Activar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <UserModal
          user={currentUser}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default Users;
