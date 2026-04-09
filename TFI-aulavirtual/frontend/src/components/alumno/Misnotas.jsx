import React, { useEffect, useState } from "react";
import axios from "axios";

const MisNotas = () => {
  const [notas, setNotas] = useState([]);

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/alumno/notas");
        setNotas(res.data);
      } catch (error) {
        console.error("Error al obtener notas", error);
      }
    };

    fetchNotas();
  }, []);

  return (
    <div>
      <h2>Mis Notas</h2>
      <ul>
        {notas.map((n, index) => (
          <li key={index}>
            {n.materia} - {n.nota}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MisNotas;