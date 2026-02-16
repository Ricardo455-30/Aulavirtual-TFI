import { useEffect, useState } from "react";
import "../../css/directivo/userManagement.css";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    email: "",
    rol: "empleado",
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("usuarios")) || [];
    setUsers(storedUsers);
  }, []);

  const saveUsers = (updatedUsers) => {
    localStorage.setItem("usuarios", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.email) {
      alert("Completa todos los campos");
      return;
    }

    if (editing) {
      const updatedUsers = users.map((u) =>
        u.id === formData.id ? formData : u
      );
      saveUsers(updatedUsers);
      setEditing(false);
    } else {
      const newUser = {
        ...formData,
        id: Date.now(),
      };
      saveUsers([...users, newUser]);
    }

    setFormData({
      id: null,
      nombre: "",
      email: "",
      rol: "empleado",
    });
  };

  const handleEdit = (user) => {
    setFormData(user);
    setEditing(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este usuario?")) {
      const filtered = users.filter((u) => u.id !== id);
      saveUsers(filtered);
    }
  };

  return (
    <div className="user-management">
      <h2>Gestión de Usuarios</h2>

      <form onSubmit={handleSubmit} className="user-form">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <select
          name="rol"
          value={formData.rol}
          onChange={handleChange}
        >
          <option value="admin">Admin</option>
          <option value="empleado">Empleado</option>
          <option value="socio">Socio</option>
        </select>

        <button type="submit">
          <FiPlus />
          {editing ? "Actualizar" : "Crear"}
        </button>
      </form>

      <table className="user-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.nombre}</td>
              <td>{user.email}</td>
              <td>{user.rol}</td>
              <td className="actions">
                <button onClick={() => handleEdit(user)}>
                  <FiEdit />
                </button>

                <button
                  className="delete"
                  onClick={() => handleDelete(user.id)}
                >
                  <FiTrash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
