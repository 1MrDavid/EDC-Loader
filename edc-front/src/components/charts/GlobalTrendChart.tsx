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

  const dataKeys = {
    ingresos: currency === 'BS' ? 'totalIngresos' as const : 'totalIngresosDolar' as const,
    egresos: currency === 'BS' ? 'totalEgresos' as const : 'totalEgresosDolar' as const,
    symbol: currency === 'BS' ? 'Bs.' : '$'
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-slate-800 font-bold text-lg">Evolución de Ingresos vs Egresos</h3>
          <p className="text-slate-500 text-xs">Comparativa histórica mensual</p>
        </div>

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

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="periodo" 
              tickFormatter={(date) => {
                // Añadimos una T00:00 para evitar desfases de zona horaria al parsear
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
            
            {/* CORRECCIÓN DEL TOOLTIP */}
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              // Usamos unknown para luego validar el tipo, evitando el error de undefined
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