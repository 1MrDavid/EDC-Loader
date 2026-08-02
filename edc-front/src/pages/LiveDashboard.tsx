import { useBotRecords } from "../hooks/useBotRecords";


export const LiveDashboard = () => {
  const { records, isLoading, isError } = useBotRecords();

  // Pequeñas estadísticas calculadas al vuelo
  const totalPendientes = records.length;
  const montoTotalAcumulado = records.reduce((acc, curr) => acc + curr.monto, 0);

  if (isLoading) return <div className="animate-pulse text-slate-500">Cargando registros en vivo...</div>;
  if (isError) return <div className="text-rose-500">Error conectando con el Bot.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* ENCABEZADO Y RESUMEN RÁPIDO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Actividad Reciente</h1>
          <p className="text-slate-500 text-sm">Gastos capturados por Telegram pendientes de conciliación.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pendientes</span>
            <span className="text-xl font-bold text-slate-800">{totalPendientes}</span>
          </div>
          <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Monto Flotante</span>
            <span className="text-xl font-bold text-slate-800">Bs. {montoTotalAcumulado.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* TABLA DE REGISTROS DEL BOT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {records.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-4xl mb-3">🎉</p>
            <p className="font-medium">¡Todo al día!</p>
            <p className="text-sm mt-1">No tienes gastos pendientes por conciliar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Fecha & Ref</th>
                  <th className="px-6 py-4">Contexto / Detalle</th>
                  <th className="px-6 py-4">Bancos (Orig → Dest)</th>
                  <th className="px-6 py-4 text-right">Monto (Bs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Badge de Tipo */}
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        r.tipo === 'FACTURA' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {r.tipo}
                      </span>
                    </td>

                    {/* Fecha y Referencia */}
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className="block font-medium text-slate-800">{r.fecha}</span>
                      <span className="block text-xs text-slate-400 font-mono mt-0.5">{r.referencia}</span>
                    </td>

                    {/* Contexto del gasto (Lo importante) */}
                    <td className="px-6 py-4 text-sm min-w-[250px]">
                      <span className="block font-semibold text-slate-900">
                        {r.concepto || "Sin concepto"}
                      </span>
                      {r.beneficiario && (
                        <span className="block text-xs text-slate-500 mt-0.5">
                          A: {r.beneficiario} {r.identificacion ? `(${r.identificacion})` : ''}
                        </span>
                      )}
                    </td>

                    {/* Ruta de Bancos */}
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {r.bancoOrigen || '?'} <span className="text-slate-300 mx-1">→</span> {r.bancoDestino || '?'}
                    </td>

                    {/* Monto */}
                    <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                      <span className="font-bold text-slate-800">
                        {r.monto.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};