import { DailyFlowChart } from "../components/charts/DailyFlowChart";
import { Header } from "../components/layout/Header";
import { MonthlyStats } from "../components/stats/MonthlyStats"; // Nuevo componente
import { MovimientosTable } from "../components/tables/MovimientosTable";
import { useDashboardData } from "../hooks/useDashboardData";

export const Dashboard = () => {
  const { 
    isLoading, 
    balanceMensual, // Data del DTO
    movimientosData, 
    filters, 
    cuentas,
    actions 
  } = useDashboardData();

  // Generador simple de años
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="bg-slate-50 min-h-screen pb-10">
      <Header />
      <main className="max-w-7xl mx-auto p-8">
        
        {/* HEADER DE CONTROL: Título + Selector de Cuenta */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
           <div>
             <h1 className="text-2xl font-bold text-slate-900">Resumen Financiero</h1>
             <p className="text-slate-500 text-sm">Selecciona una cuenta y un periodo para ver el análisis.</p>
           </div>

           {/* Selector de Cuenta Principal */}
           <div className="w-full md:w-64">
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cuenta</label>
             <select 
               value={filters.selectedAccountId || ""}
               onChange={(e) => actions.setSelectedAccountId(Number(e.target.value))}
               className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white font-medium focus:ring-2 focus:ring-slate-900 outline-none"
             >
               {cuentas.map(c => (
                 <option key={c.id} value={c.id}>{c.cuenta} - {c.numero}</option>
               ))}
             </select>
           </div>
        </div>

        {/* --- NUEVA SECCIÓN DE ESTADÍSTICAS --- */}
        {/* Se alimenta del mes y año seleccionados abajo, o los default */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold text-slate-800">
               Balance de {new Date(0, filters.month - 1).toLocaleString('es', { month: 'long' })} {filters.year}
             </h2>
          </div>

          {/* GRID: Estadísticas a la izquierda, Gráfico a la derecha */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Columna Izquierda: Tarjetas de estadísticas */}
            <div className="lg:col-span-1">
               <MonthlyStats 
                 data={balanceMensual} 
                 loading={isLoading} 
                 className="h-full" // Para que ocupen el alto necesario
               />
            </div>

            {/* Columna Derecha: Gráfico visual */}
            <div className="lg:col-span-2">
               {/* Pasamos los movimientos para que el gráfico los procese */}
               {movimientosData?.content && (
                 <DailyFlowChart movimientos={movimientosData.content} />
               )}
            </div>
            
          </div>
        </section>


        {/* Sección Tabla con Controles */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* HEADER TABLA: Filtros de Fecha */}
          <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">Movimientos</h2>
            
            <div className="flex gap-2">
              <select 
                value={filters.month} 
                onChange={(e) => {
                   actions.setMonth(Number(e.target.value));
                   actions.setPage(0);
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

          {/* Paginación (igual que antes) */}
          {/* ... footer paginación ... */}

        </section>
      </main>
    </div>
  );
};