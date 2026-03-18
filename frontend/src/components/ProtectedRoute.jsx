// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children, rolesPermitidos }) => {
//   const token = localStorage.getItem("token");
//   const usuario = JSON.parse(localStorage.getItem("usuario"));

//   // 🔐 No hay token
//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   // 🔐 No hay usuario guardado
//   if (!usuario) {
//     return <Navigate to="/login" replace />;
//   }
//   if (!token || !usuario) {
//   return <Navigate to="/login" replace />;
// }
//   // 🛡 Validación por rol
//   if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
//     return <Navigate to="/no-autorizado" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;