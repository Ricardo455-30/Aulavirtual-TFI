import React, { useState } from "react";

const AlumnosSection = () => {
  const [alumnos] = useState([
    { id: 1, nombre: "Juan Pérez", curso: "1° A" },
    { id: 2, nombre: "Lucía Gómez", curso: "1° A" },
    { id: 3, nombre: "Carlos Díaz", curso: "2° B" }
  ]);

  return (
    <div>
      <h2>Lista de Alumnos</h2>

      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Curso</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map(alumno => (
            <tr key={alumno.id}>
              <td>{alumno.nombre}</td>
              <td>{alumno.curso}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlumnosSection;
