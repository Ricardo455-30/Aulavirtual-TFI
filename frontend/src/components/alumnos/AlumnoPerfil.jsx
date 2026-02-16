import React, { useState } from "react";

const AlumnoPerfil = () => {
  const [nombre, setNombre] = useState("Juan Pérez");
  const [email, setEmail] = useState("juan@email.com");

  const guardarCambios = () => {
    alert("Cambios guardados correctamente");
  };

  return (
    <div>
      <h1>👤 Mi Perfil</h1>

      <div className="perfil-form">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={guardarCambios}>
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default AlumnoPerfil;
