export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");

  // Opcional: limpiar todo
  // localStorage.clear();

  window.location.href = "/login";
};