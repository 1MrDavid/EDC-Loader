import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { type ValorDolarDTO } from '../../types/finance';

interface Props {
  data: ValorDolarDTO[];
}

export const DollarTrendChart = ({ data }: Props) => {
  // Preparamos la data: Ordenamos cronológicamente y formateamos fecha
  const chartData = [...data]
    .sort((a, b) => {
      // Creamos objetos fecha para comparar correctamente
      const dateA = new Date(a.ano, a.mes - 1, a.dia);
      const dateB = new Date(b.ano, b.mes - 1, b.dia);
      return dateA.getTime() - dateB.getTime();
    })
    .map(item => ({
      ...item,
      // Label corto para el eje X: "15 feb."
      dateLabel: new Date(item.ano, item.mes - 1, item.dia)
        .toLocaleDateString('es-VE', { day: 'numeric', month: 'short' }),
      // Label largo para el tooltip
      fullDate: new Date(item.ano, item.mes - 1, item.dia)
        .toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })
    }));

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-[400px]">
      <h3 className="text-slate-800 font-bold text-lg mb-6">Evolución de la Tasa (BCV)</h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          
          <XAxis 
            dataKey="dateLabel" 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false} 
            minTickGap={30} // Evita que se amontonen las fechas
          />
          
          <YAxis 
            domain={['auto', 'auto']} // Ajusta la escala automáticamente al min/max
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(val) => `Bs. ${val}`}
          />
          
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ color: '#64748b', marginBottom: '0.5rem' }}
            formatter={(value: number | undefined) => {
                if (value === undefined || value === null) {
                  return ['Bs. 0,00', 'Tasa'];
                }
                return [`Bs. ${new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(value)}`, 'Tasa'];
            }}
            labelFormatter={(label, payload) => {
               if (payload && payload.length > 0) {
                 return payload[0].payload.fullDate;
               }
               return label;
            }}
          />
          
          <Line 
            type="monotone" 
            dataKey="precio" 
            stroke="#2563eb" // Azul intenso
            strokeWidth={3}
            dot={false} // Ocultamos los puntos para que la linea sea limpia
            activeDot={{ r: 6, strokeWidth: 0 }} // Punto solo al pasar el mouse
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};