import React from "react";

const notas = [
  { materia: "Matemática", nota: 9 },
  { materia: "Lengua", nota: 8 },
  { materia: "Historia", nota: 7 },
  { materia: "Inglés", nota: 10 }
];

const AlumnoNotas = () => {
  return (
    <div>
      <h1>📝 Calificaciones</h1>

      <table className="tabla">
        <thead>
          <tr>
            <th>Materia</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          {notas.map((item, index) => (
            <tr key={index}>
              <td>{item.materia}</td>
              <td>{item.nota}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlumnoNotas;
