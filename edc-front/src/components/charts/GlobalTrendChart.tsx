import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { type BalanceGlobalMensualDTO } from '../../types/finance';

interface Props {
  data: BalanceGlobalMensualDTO[];
}

export const GlobalTrendChart = ({ data }: Props) => {
  
  // Formateamos la fecha para el eje X (ej: "oct. 2025")
  const chartData = data.map(item => {
    const [year, month] = item.periodo.split('-').map(Number);
    return {
      ...item,
      name: new Date(year, month - 1).toLocaleDateString('es-VE', { month: 'short', year: 'numeric' }),
    };
  });

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-slate-800 font-bold text-lg">Evolución de Ingresos vs Egresos</h3>
        {/* Aquí podrías poner un selector de año si quisieras en el futuro */}
      </div>

      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(val) => `Bs ${(val/1000).toFixed(0)}k`}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number | undefined) => {
            // 1. Si es undefined o null, devolvemos 0 o un string vacío para evitar el error
            if (value === undefined || value === null) {
            return ['Bs. 0,00', ''];
        }
    
    // 2. Si existe, lo formateamos
    return [`Bs. ${new Intl.NumberFormat('es-VE').format(value)}`, ''];
  }}
/>
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
          
          <Bar name="Ingresos" dataKey="totalIngresos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
          <Bar name="Egresos" dataKey="totalEgresos" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};