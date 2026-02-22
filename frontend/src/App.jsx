import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Registro from "./pages/Registro";
import LandingPage from "./pages/LandingPage";
import LoadingPage from "./pages/LoadingPage";

import AdminLayout from "./pages/paneles/admin/AdminPanel";
import PanelDirectivo from "./pages/paneles/Directivos/PanelDirectivo";
import TutorPanel from "./pages/paneles/Tutor/TutorPanel";
import DocentePanel from "./pages/paneles/docente/DocentePanel";
import AlumnoPanel from "./pages/alumnos/AlumnoPanel";
import AutoLogout from "../src/components/AutoLogout";
import NoAutorizado from "./pages/NoAutorizado";
import ProtectedRoute from "./components/ProtectedRoute";
import ResetPassword from "./pages/ResetPassword";
function App() {
  return (
    <Router>
            <AutoLogout />

      <Routes>
        {/* Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset/:token" element={<ResetPassword />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/no-autorizado" element={<NoAutorizado />} />

        {/* Protegidas */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute rolesPermitidos={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/directivo/*"
          element={
            <ProtectedRoute rolesPermitidos={["directivo"]}>
              <PanelDirectivo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/docente/*"
          element={
            <ProtectedRoute rolesPermitidos={["docente"]}>
              <DocentePanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumno/*"
          element={
            <ProtectedRoute rolesPermitidos={["alumno"]}>
              <AlumnoPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/*"
          element={
            <ProtectedRoute rolesPermitidos={["tutor"]}>
              <TutorPanel />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;