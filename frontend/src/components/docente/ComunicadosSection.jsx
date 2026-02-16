import React, { useState } from "react";

const ComunicadosSection = () => {
  const [mensaje, setMensaje] = useState("");

  const enviarComunicado = () => {
    alert("Comunicado enviado 📢");
    setMensaje("");
  };

  return (
    <div>
      <h2>Enviar Comunicado</h2>

      <textarea
        placeholder="Escriba el comunicado..."
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
      />

      <button onClick={enviarComunicado}>
        Enviar
      </button>
    </div>
  );
};

export default ComunicadosSection;
