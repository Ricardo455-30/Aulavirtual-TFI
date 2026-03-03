// src/services/cursos.service.js
import { CURSOS_URL } from "../../endpoints/endpoints";

export async function getCursos() {
  const token = localStorage.getItem("token"); // ajustá si guardás con otro nombre

  const res = await fetch(CURSOS_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Si tu middleware corta por falta de token/rol, esto te ayuda a verlo claro
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Error ${res.status} al traer cursos. ${msg}`);
  }

  return res.json(); // devuelve array: rows de MySQL
}