import { useNavigate } from "react-router-dom"; 
import { GlobalTrendChart } from "../components/charts/GlobalTrendChart";
import { AccountCard } from "../components/cards/AccountCard";
import { MovimientosTable } from "../components/tables/MovimientosTable";
import { Header } from "../components/layout/Header";
import { useHomeData } from "../hooks/useHomeData"; // <--- Importamos el nuevo hook

export const Home = () => {
  const navigate = useNavigate();
  
  // Usamos el hook que ya tiene la lógica de fechas inteligentes
  const { 
    historialGlobal, 
    cuentas, 
    movimientosData, 
    filters, 
    actions 
  } = useHomeData();

  // Generador de años para el select
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="bg-slate-50 min-h-screen pb-10">
      <Header />
      
      <main className="max-w-7xl mx-auto p-8 space-y-8">
        
        {/* TITULO */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visión General</h1>
          <p className="text-slate-500 text-sm">Resumen consolidado de todas tus cuentas bancarias.</p>
        </div>

        {/* SECCIÓN 1: GRÁFICO HISTÓRICO */}
        <section>
           <GlobalTrendChart data={historialGlobal} />
        </section>

        {/* SECCIÓN 2: TUS CUENTAS */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Tus Cuentas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cuentas.map(cuenta => (
              <AccountCard 
                key={cuenta.id} 
                cuenta={cuenta} 
                onClick={() => navigate(`/cuenta/${cuenta.id}`)}
              />
            ))}
          </div>
        </section>

        {/* SECCIÓN 3: MOVIMIENTOS RECIENTES (CON FILTROS) */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* HEADER DE LA TABLA: Título + Filtros de Fecha */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Movimientos Recientes (Global)
              </h2>
              <p className="text-xs text-slate-400">
                Mostrando actividad consolidada.
              </p>
            </div>

            {/* --- SELECTORES DE FECHA --- */}
            <div className="flex gap-2">
              <select 
                value={filters.month} 
                onChange={(e) => {
                   actions.setMonth(Number(e.target.value));
                   actions.setPage(0); // Reset página al cambiar mes
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-slate-100"
              >
                {Array.from({length: 12}, (_, i) => (
                  <option key={i+1} value={i+1}>
                    {new Date(0, i).toLocaleString('es', {month: 'long'})}
                  </option>
                ))}
              </select>

              <select 
                value={filters.year} 
                onChange={(e) => {
                  actions.setYear(Number(e.target.value));
                  actions.setPage(0);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-slate-100"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {/* --------------------------- */}

          </div>

          <MovimientosTable 
            data={movimientosData?.content || []} 
            currentPage={filters.page}
            totalPages={movimientosData?.totalPages || 1}
            onPageChange={actions.setPage}
          />
        </section>

      </main>
    </div>
  );
};