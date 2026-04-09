import Home from "./Pages/Home";
import {Routes, Route, BrowserRouter} from "react-router-dom";
import {HOME, LOGIN, VIEW, EDITAR} from "./Routers/router";

import LoginPage from "./Pages/LoginPage";
import ViewPage from "./Pages/ViewPage";
import EditarPage from "./Pages/EditarPage";

function App() {
  

  return (


  <BrowserRouter>
    <Routes>
      <Route path={HOME} element={<Home />} />
      <Route path={LOGIN} element={<LoginPage />} />
      <Route path={VIEW} element={<ViewPage />} />
      <Route path={EDITAR} element={<EditarPage />} />
    </Routes>
</BrowserRouter>
     
    
  )
}

export default App
