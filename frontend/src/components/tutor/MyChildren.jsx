// src/components/tutor/MyChildren.jsx
import React from "react";

const MyChildren = () => {
  const childrenData = [
    { name: "Juan Pérez", grade: "5° A", lastGrade: "9", lastUpdate: "2026-02-10" },
    { name: "Ana Pérez", grade: "3° B", lastGrade: "8", lastUpdate: "2026-02-09" },
  ];

  return (
    <div className="my-children">
      <h2>Mis Hijos</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Curso</th>
            <th>Última Calificación</th>
            <th>Última Actualización</th>
          </tr>
        </thead>
        <tbody>
          {childrenData.map((child, idx) => (
            <tr key={idx}>
              <td>{child.name}</td>
              <td>{child.grade}</td>
              <td>{child.lastGrade}</td>
              <td>{child.lastUpdate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyChildren;
