import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { type BalanceGlobalMensualDTO } from '../../types/finance';

interface Props {
  data: BalanceGlobalMensualDTO[];
}

export const GlobalTrendChart = ({ data }: Props) => {
  const [currency, setCurrency] = useState<'BS' | 'USD'>('BS');
  
  // Estado para controlar cuántos meses mostrar. 12 es un buen estándar visual.
  // El valor 0 representará "Histórico completo"
  const [monthsToShow, setMonthsToShow] = useState<number>(12);

  const dataKeys = {
    ingresos: currency === 'BS' ? 'totalIngresos' as const : 'totalIngresosDolar' as const,
    egresos: currency === 'BS' ? 'totalEgresos' as const : 'totalEgresosDolar' as const,
    symbol: currency === 'BS' ? 'Bs.' : '$'
  };

  // Lógica de filtrado: Cortamos el array para tomar solo los últimos N meses
  // Si monthsToShow es 0, pasamos la data completa
  const displayData = monthsToShow === 0 
    ? data 
    : data.slice(-monthsToShow);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-slate-800 font-bold text-lg">Evolución de Ingresos vs Egresos</h3>
          <p className="text-slate-500 text-xs">Comparativa histórica mensual</p>
        </div>

        {/* Controles del Gráfico */}
        <div className="flex items-center gap-3">
          
          {/* Selector de meses a mostrar */}
          <select 
            value={monthsToShow}
            onChange={(e) => setMonthsToShow(Number(e.target.value))}
            className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-600 outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
          >
            <option value={6}>Últimos 6 meses</option>
            <option value={12}>Últimos 12 meses</option>
            <option value={0}>Histórico completo</option>
          </select>

          {/* Switch de Moneda */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setCurrency('BS')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                currency === 'BS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Bs.
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                currency === 'USD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              USD
            </button>
          </div>
        </div>
      </div>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          {/* Asegúrate de pasar displayData en lugar de data */}
          <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="periodo" 
              tickFormatter={(date) => {
                const d = new Date(date + 'T00:00:00');
                return d.toLocaleDateString('es-VE', { month: 'short', year: 'numeric' });
              }}
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                if (value === 0) return '0';
                return `${dataKeys.symbol}${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`;
              }}
            />
            
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: any) => {
                const numericValue = typeof value === 'number' ? value : 0;
                return [
                  `${dataKeys.symbol} ${new Intl.NumberFormat('es-VE', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  }).format(numericValue)}`, 
                  ''
                ];
              }}
              labelFormatter={(label) => {
                const d = new Date(label + 'T00:00:00');
                return d.toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });
              }}
            />
            
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
            
            <Bar 
              name="Ingresos" 
              dataKey={dataKeys.ingresos} 
              fill="#10b981" 
              radius={[4, 4, 0, 0]} 
              barSize={24} 
            />
            <Bar 
              name="Egresos" 
              dataKey={dataKeys.egresos} 
              fill="#ef4444" 
              radius={[4, 4, 0, 0]} 
              barSize={24} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};