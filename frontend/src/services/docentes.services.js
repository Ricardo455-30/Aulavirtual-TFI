export const getPerfilDocente = async () => {

  const res = await fetch("http://localhost:8000/api/docentes/perfil", {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  });

  return res.json();

};