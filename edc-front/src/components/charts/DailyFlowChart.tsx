import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { type FlujoDiarioDTO } from '../../types/finance';

interface Props {
  data: FlujoDiarioDTO[];
}

export const DailyFlowChart = ({ data }: Props) => {
  
  // Transformación de datos (OK)
  const chartData = data.map(item => {
    const [year, month, day] = item.fecha.split('-').map(Number);
    return {
      ...item,
      dateLabel: new Date(year, month - 1, day).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })
    };
  });

  return (
    <div className="h-[350px] w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">Flujo Diario (Ingresos vs Egresos)</h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          
          <XAxis 
            dataKey="dateLabel" 
            tick={{ fontSize: 10, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false}
            minTickGap={10}
          />
          
          <YAxis 
            tick={{ fontSize: 10, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(val) => `Bs. ${val/1000}k`} 
          />
          
          {/* --- CORRECCIÓN DEL TOOLTIP --- */}
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            // 1. Aceptamos union type (number | string | undefined)
            formatter={(value: number | string | undefined) => {
              // 2. Validación de seguridad
              if (value === undefined || value === null) return ['Bs. 0,00', ''];
              
              // 3. Aseguramos que sea número
              const numValue = Number(value);
              
              return [`Bs. ${new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(numValue)}`, ''];
            }}
          />
          
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
          
          <Bar dataKey="totalIngresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={8} />
          <Bar dataKey="totalEgresos" name="Egresos" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};