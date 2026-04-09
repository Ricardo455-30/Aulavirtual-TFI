import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import CardCuenta from "./CardCuenta";

const AdminRechazados = forwardRef(({ recargarListas }, ref) => {
  const [usuarios, setUsuarios] = useState([]);
  const token = localStorage.getItem("token");

  const cargar = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/rechazados", {
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

  return (
    <div className="section">
      <h2>Cuentas Rechazadas</h2>

      {usuarios.length === 0 ? (
        <p>No hay cuentas rechazadas</p>
      ) : (
        usuarios.map((u) => (
          <CardCuenta
            key={u.id}
            cuenta={u}
            modo="rechazado"
            onAprobar={() => aprobar(u.id)}
          />
        ))
      )}
    </div>
  );
});

export default AdminRechazados;