import { Routes, Route } from "react-router-dom";
import { Dashboard } from "../pages/Dashboard";
import { CargaArchivos } from "../pages/CargaArchivos"; // Importar
import { Home } from "../pages/Home";
import { DollarPage } from "../pages/DollarPage";

function App() {
  return (

    <Routes>
      {/* Ruta Principal: El nuevo Home que acabamos de crear */}
      <Route path="/" element={<Home />} />
  
      {/* Ruta Detalle: Tu Dashboard anterior */}
      {/* Ahora Dashboard debe leer el ID de la URL usando useParams() */}
      <Route path="/cuenta/:id" element={<Dashboard />} />

      <Route path="/cargar" element={<CargaArchivos />} />
      <Route path="/divisas" element={<DollarPage />} />
      </Routes>
  );
}
export default App;