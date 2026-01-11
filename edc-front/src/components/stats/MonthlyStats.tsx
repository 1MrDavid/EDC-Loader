import { type BalanceMensualDTO } from "../../types/finance";

interface Props {
  data: BalanceMensualDTO | null;
  loading: boolean;
}

export const MonthlyStats = ({ data, loading, className = "" }: Props & { className?: string }) => {
  if (loading) return <div className="h-32 bg-gray-100 rounded-2xl animate-pulse w-full"></div>;
  
  if (!data) return (
    <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl text-orange-800 text-sm">
      No hay estadísticas calculadas para este mes y cuenta.
    </div>
  );

  const formatCurrency = (val: number) => {
    // 1. Formateamos el número usando las reglas de Venezuela (coma para decimales, punto para miles)
    const numeroFormateado = new Intl.NumberFormat('es-VE', { 
      style: 'decimal', 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(val);

    // 2. Agregamos manualmente el prefijo "Bs."
    return `Bs. ${numeroFormateado}`;
  };

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      
      {/* TARJETA 1: Flujo Neto */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">Flujo del Periodo</h3>
          <div className="flex items-baseline gap-2">
             <span className={`text-3xl font-bold ${data.flujo_neto >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {data.flujo_neto > 0 ? '+' : ''}{formatCurrency(data.flujo_neto)}
             </span>
             <span className="text-xs text-slate-400 font-medium">Neto</span>
          </div>
        </div>
        
        {/* Barras de progreso */}
        <div className="mt-6 space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600">Ingresos ({data.numero_ingresos})</span>
              <span className="font-bold text-slate-700">{formatCurrency(data.ingresos_total)}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600">Egresos ({data.numero_egresos})</span>
              <span className="font-bold text-slate-700">{formatCurrency(data.egresos_total)}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className="bg-rose-500 h-2 rounded-full" 
                style={{ width: `${Math.min((data.egresos_total / (data.ingresos_total || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* TARJETA 2: Evolución de Saldo */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-6">Evolución de Saldo</h3>
        
        <div className="flex items-center justify-between relative">
           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-0"></div>

           <div className="bg-white pr-2 z-10">
              <p className="text-xs text-slate-400 mb-1">Inicio Mes</p>
              <p className="font-bold text-slate-700 text-lg">{formatCurrency(data.monto_inicio)}</p>
           </div>
           
           <div className="bg-white pl-2 z-10 text-right">
              <p className="text-xs text-slate-400 mb-1">Fin Mes</p>
              <p className={`font-bold text-lg ${data.saldo_variacion >= 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                {formatCurrency(data.monto_final)}
              </p>
           </div>
        </div>

        <div className="mt-6 p-3 bg-slate-50 rounded-lg flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium">Variación Total</span>
          <span className={`text-sm font-bold ${data.saldo_variacion >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
             {data.saldo_variacion >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(data.saldo_variacion))}
          </span>
        </div>
      </div>

      {/* TARJETA 3: Promedios */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center space-y-6">
         <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Ticket Promedio Ingreso</h3>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(data.promedio_ingreso || 0)}</p>
         </div>
         <div className="border-t border-slate-100 pt-4">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Ticket Promedio Egreso</h3>
            <p className="text-2xl font-bold text-rose-600">{formatCurrency(data.promedio_egreso || 0)}</p>
         </div>
      </div>

    </div>
  );
};