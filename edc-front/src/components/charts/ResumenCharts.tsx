export const ResumenChart = ({ historial }: { historial: { fecha: string; valor: number }[] }) => {
  const ultimaTasa = historial.length > 0 ? historial[historial.length - 1].valor : 0;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
      <p className="text-gray-500 text-sm font-medium mb-1">Tipo de Cambio USD/EUR</p>
      <div className="flex items-baseline gap-3 mb-8">
        <span className="text-4xl font-bold">{ultimaTasa.toFixed(2)}</span>
        <span className="text-green-500 text-sm font-bold">Ultimos 30 días +0.5%</span>
      </div>
      
      {/* Contenedor del Gráfico */}
      <div className="h-64 w-full relative">
        <svg viewBox="0 0 800 200" className="w-full h-full">
          <path
            d="M0,150 Q100,80 200,120 T400,100 T600,140 T800,50"
            fill="none"
            stroke="#64748b"
            strokeWidth="3"
          />
        </svg>
        <div className="flex justify-between mt-4 text-gray-400 text-xs font-bold uppercase tracking-wider">
          <span>1 de mayo</span>
          <span>15 de mayo</span>
          <span>29 de mayo</span>
        </div>
      </div>
    </div>
  );
};