import { Routes, Route } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { LiveDashboard } from "../pages/LiveDashboard";
import { HistorialDashboard } from "../pages/HistorialDashboard";
import { Dashboard } from "../pages/Dashboard";
import { CargaArchivos } from "../pages/CargaArchivos";
import { DollarPage } from "../pages/DollarPage";
import { CategoriasPage } from "../pages/CategoriasPage";
import { DeudasPage } from "../pages/DeudasPage";
import { AhorrosLimitesPage } from "../pages/AhorrosLimitesPage";
import { CuentasAhorroPage } from "../pages/CuentasAhorroPage";

function App() {
  return (
    <Routes>
      {/* 
        Ruta Envolvedora (Layout Base):
        Todas las rutas dentro de este bloque tendrán el Sidebar y el Header fijo.
      */}
      <Route element={<MainLayout />}>
        
        {/* Ruta Principal: Gastos en vivo (Bot de Telegram) */}
        <Route path="/" element={<LiveDashboard />} />
        
        {/* Ruta Historial: Tu antiguo Home con los gráficos globales */}
        <Route path="/historial" element={<HistorialDashboard />} />
    
        {/* Ruta Detalle de Cuenta individual */}
        <Route path="/cuenta/:id" element={<Dashboard />} />

        {/* Utilidades y Configuraciones */}
        <Route path="/cargar" element={<CargaArchivos />} />
        <Route path="/divisas" element={<DollarPage />} />
        <Route path="/categorias" element={<CategoriasPage />} />
        
        <Route path="/deudas" element={<DeudasPage />} />

        <Route path="/ahorros-limites" element={<AhorrosLimitesPage />} />
        <Route path="/cuentas-ahorro" element={<CuentasAhorroPage />} />
      </Route>
    </Routes>
  );
}

export default App;