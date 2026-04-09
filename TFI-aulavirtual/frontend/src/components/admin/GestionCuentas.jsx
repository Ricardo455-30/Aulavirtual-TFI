import React, { useState, useRef } from "react";

import AdminPendientes from "./AdminPendientes";
import AdminAprobados from "./AdminAprobados";
import AdminRechazados from "./AdminRechazados";

const GestionCuentas = () => {
  const [tab, setTab] = useState("pendientes");

  const pendientesRef = useRef();
  const aprobadosRef = useRef();
  const rechazadosRef = useRef();

  const recargarTodo = () => {
    pendientesRef.current?.recargar?.();
    aprobadosRef.current?.recargar?.();
    rechazadosRef.current?.recargar?.();
  };

  return (
    <div>
        <p className="titulo" >Gestiona las cuentas de usuario en el sistema, aprobando o rechazando solicitudes de registro
           
        </p>

      {/* 🔹 SUB NAV */}
      <div className="sub-navbar">
        <button
          className={tab === "pendientes" ? "active-tab" : ""}
          onClick={() => setTab("pendientes")}
        >
          Pendientes
        </button>

        <button
          className={tab === "aprobados" ? "active-tab" : ""}
          onClick={() => setTab("aprobados")}
        >
          Aprobados
        </button>

        <button
          className={tab === "rechazados" ? "active-tab" : ""}
          onClick={() => setTab("rechazados")}
        >
          Rechazados
        </button>
      </div>

      {/* 🔹 CONTENIDO */}
      {tab === "pendientes" && (
        <AdminPendientes ref={pendientesRef} recargarListas={recargarTodo} />
      )}

      {tab === "aprobados" && (
        <AdminAprobados ref={aprobadosRef} />
      )}

      {tab === "rechazados" && (
        <AdminRechazados ref={rechazadosRef} />
      )}
    </div>
  );
};

export default GestionCuentas;