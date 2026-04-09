import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import DirectivoDashboard from "./pages/DirectivoDashboard";
import DocenteDashboard from "./pages/DocenteDashboard";
import  AlumnoDashboard from "./pages/AlumnoDashboard";


// Páginas públicas
import LandingPage from "./pages/LandingPage";
import Registro from "./pages/Registro";
import Login from "./pages/Login";
import LoadingPage from "./pages/LoadingPage";
import NoAutorizado from "./pages/NoAutorizado";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🌐 Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/no-autorizado" element={<NoAutorizado />} />

        {/* 🔐 SOLO ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute rolesPermitidos={["superadmin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      {/* 🔐 ADMIN y EMPLEADO */}
        <Route
          path="/directivo"
          element={
            <ProtectedRoute rolesPermitidos={["admin", "directivo"]}>
              <DirectivoDashboard />
            </ProtectedRoute>
          }
        />

      {/* 🔐 SOLO DOCENTE */}
        <Route
          path="/docente"
          element={
            <ProtectedRoute rolesPermitidos={["docente"]}>
              <DocenteDashboard />
            </ProtectedRoute>
          }
        />
        
      {/* 🔐 SOLO ALUMNO */}
    
        <Route
          path="/alumno"
          element={
            <ProtectedRoute rolesPermitidos={["alumno"]}>
              <AlumnoDashboard />
            </ProtectedRoute>
          }
        />




        {/* 🔁 Redirección si la ruta no existe */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;