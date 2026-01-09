import { Routes, Route } from "react-router-dom";
import { Dashboard } from "../pages/Dashboard";
import { CargaArchivos } from "../pages/CargaArchivos"; // Importar

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/cargar" element={<CargaArchivos />} /> {/* Nueva Ruta */}
    </Routes>
  );
}
export default App;