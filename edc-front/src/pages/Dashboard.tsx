import { Header } from "../components/layout/Header";
import { SaldoCard } from "../components/cards/SaldoCard";
import { MovimientosTable } from "../components/tables/MovimientosTable";
import { useDashboardData } from "../hooks/useDashboardData";

export const Dashboard = () => {
  const { isLoading, saldoUSD, saldoBS, movimientosData, filters, actions } = useDashboardData();

  console.log("Movimientos Data:", movimientosData);

  // Generador simple de años (ej: 2023, 2024, 2025)
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  if (isLoading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-10">
      <Header />
      <main className="max-w-6xl mx-auto p-8">
        
        {/* Tarjetas de Saldo (Sin cambios) */}
        <section className="mb-8 flex gap-6">
           <SaldoCard titulo="Patrimonio Total (USD)" monto={saldoUSD} moneda="USD" />
           <SaldoCard titulo="Disponible (BS)" monto={saldoBS} moneda="VED" />
        </section>

        {/* Sección Tabla con Controles */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* HEADER DE LA TABLA: Filtros */}
          <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">Movimientos</h2>
            
            <div className="flex gap-2">
              <select 
                value={filters.month} 
                onChange={(e) => {
                  actions.setMonth(Number(e.target.value));
                  actions.setPage(0); // Resetear a pag 1 al filtrar
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {Array.from({length: 12}, (_, i) => (
                  <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('es', {month: 'long'})}</option>
                ))}
              </select>

              <select 
                value={filters.year} 
                onChange={(e) => actions.setYear(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* TABLA */}
          <MovimientosTable data={movimientosData?.content || []} />

          {/* FOOTER DE LA TABLA: Paginación */}
          <div className="p-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Página {filters.page + 1} de {movimientosData?.totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button
                disabled={filters.page === 0}
                onClick={() => actions.setPage(p => p - 1)}
                className="px-4 py-2 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                disabled={movimientosData?.last}
                onClick={() => actions.setPage(p => p + 1)}
                className="px-4 py-2 border rounded text-sm disabled:opacity-50 hover:bg-gray-50 bg-slate-900 text-white hover:bg-slate-800"
              >
                Siguiente
              </button>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
};