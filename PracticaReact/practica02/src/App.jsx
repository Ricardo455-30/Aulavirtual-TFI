c
import Home from './pages/Home';
import Formulario from './componentes/Formulario';
import Login from './pages/Login';
import Registro from './pages/Registro';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/registro" element={<Registro />} />
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;