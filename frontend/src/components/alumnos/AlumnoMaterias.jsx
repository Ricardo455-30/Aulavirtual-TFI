import React from "react";

const materias = [
  {
    id: 1,
    nombre: "Matemática",
    codigo: "MAT-2026",
    profesor: "Prof. Gómez",
    progreso: 70,
    imagen: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb"
  },
  {
    id: 2,
    nombre: "Lengua y Literatura",
    codigo: "LEN-2026",
    profesor: "Prof. Díaz",
    progreso: 45,
    imagen: "https://images.unsplash.com/photo-1516979187457-637abb4f9353"
  },
  {
    id: 3,
    nombre: "Historia",
    codigo: "HIS-2026",
    profesor: "Prof. Pérez",
    progreso: 80,
    imagen: "https://images.unsplash.com/photo-1461360370896-922624d12aa1"
  }
];

const AlumnoMaterias = () => {

  const guardarReciente = (materia) => {
    let recientes = JSON.parse(localStorage.getItem("materiasRecientes")) || [];

    recientes = recientes.filter(m => m.id !== materia.id);
    recientes.unshift(materia);

    if (recientes.length > 5) recientes.pop();

    localStorage.setItem("materiasRecientes", JSON.stringify(recientes));
  };

  return (
    <div>
      <h1 className="moodle-title">Mis Cursos</h1>

      <div className="moodle-grid">
        {materias.map((materia) => (
          <div
            key={materia.id}
            className="moodle-card"
            onClick={() => guardarReciente(materia)}
          >
            <div
              className="moodle-card-img"
              style={{ backgroundImage: `url(${materia.imagen})` }}
            />

            <div className="moodle-card-body">
              <span className="moodle-code">{materia.codigo}</span>
              <h3>{materia.nombre}</h3>
              <p>{materia.profesor}</p>

              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${materia.progreso}%` }}
                />
              </div>

              <span className="progress-text">
                Progreso: {materia.progreso}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlumnoMaterias;
