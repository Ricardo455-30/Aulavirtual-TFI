import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import CardCuenta from "./CardCuenta";

const AdminPendientes = forwardRef(({ recargarListas }, ref) => {
  const [usuarios, setUsuarios] = useState([]);
  const token = localStorage.getItem("token");

  const cargar = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/pendientes", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  useImperativeHandle(ref, () => ({
    recargar: cargar,
  }));

  const aprobar = async (id) => {
    await fetch(`http://localhost:8000/api/auth/aprobar/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    recargarListas();
  };

  const rechazar = async (id) => {
    await fetch(`http://localhost:8000/api/auth/rechazar/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    recargarListas();
  };

  return (
    <div className="section">
      <h2>Cuentas Pendientes</h2>

      {usuarios.length === 0 ? (
        <p>No hay cuentas pendientes</p>
      ) : (
        usuarios.map((u) => (
          <CardCuenta
            key={u.id}
            cuenta={u}
            modo="pendiente"
            onAprobar={() => aprobar(u.id)}
            onRechazar={() => rechazar(u.id)}
          />
        ))
      )}
    </div>
  );
});

export default AdminPendientes;