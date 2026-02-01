import { useQuery } from "@tanstack/react-query";
import { obtenerHistorialDolar } from "../services/bankingService";
import { Header } from "../components/layout/Header";
import { DollarTrendChart } from "../components/charts/DollarTrendChart";
import { DollarHistoryTable } from "../components/tables/DollarHistoryTable";

export const DollarPage = () => {
  
  const { data, isLoading } = useQuery({
    queryKey: ["dolarHistory"],
    queryFn: obtenerHistorialDolar
  });

  if (isLoading) return <div className="p-10 text-center text-slate-400">Cargando tasas...</div>;

  const dollarData = data || [];
  
  // Obtenemos la última tasa disponible para mostrarla en grande
  const sortedByDate = [...dollarData].sort((a, b) => {
      const dateA = new Date(a.ano, a.mes - 1, a.dia);
      const dateB = new Date(b.ano, b.mes - 1, b.dia);
      return dateB.getTime() - dateA.getTime();
  });
  const currentRate = sortedByDate[0]?.precio || 0;
  const lastUpdate = sortedByDate[0] 
    ? new Date(sortedByDate[0].ano, sortedByDate[0].mes - 1, sortedByDate[0].dia).toLocaleDateString('es-VE')
    : "-";

  return (
    <div className="bg-slate-50 min-h-screen pb-10">
      <Header />
      
      <main className="max-w-7xl mx-auto p-8 space-y-8">
        
        {/* HEADER SIMPLE */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
           <div>
             <h1 className="text-2xl font-bold text-slate-900">Monitor Dolar</h1>
             <p className="text-slate-500 text-sm">Histórico de la tasa oficial de cambio.</p>
           </div>
           
           {/* KPI DESTACADO */}
           <div className="bg-white px-6 py-3 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4">
              <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                 <p className="text-xs text-slate-500 font-bold uppercase">Tasa Actual</p>
                 <p className="text-2xl font-bold text-slate-900">Bs. {currentRate}</p>
                 <p className="text-[10px] text-slate-400">Al {lastUpdate}</p>
              </div>
           </div>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* GRÁFICO (Ocupa 2 columnas) */}
           <div className="lg:col-span-2">
              <DollarTrendChart data={dollarData} />
           </div>

           {/* TABLA (Ocupa 1 columna) */}
           <div className="lg:col-span-1">
              <DollarHistoryTable data={dollarData} />
           </div>
        </div>

      </main>
    </div>
  );
};