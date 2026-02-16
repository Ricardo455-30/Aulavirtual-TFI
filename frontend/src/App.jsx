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
import AuthRedirect from "./components/AuthRedirect";

function App() {
  return (
    <Router>  {/* <-- Solo un Router */}
      <Routes>
        <Route path="/" element={<AuthRedirect />} />

        <Route path="/alumno/*" element={<AlumnoPanel />} />
        <Route path="/docente/*" element={<DocentePanel />} />
        <Route path="/tutor/*" element={<TutorPanel />} />
        <Route path="/directivo/*" element={<PanelDirectivo />} />
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/loading" element={<LoadingPage />} />

      </Routes>
    </Router>
  );
}

export default App;
