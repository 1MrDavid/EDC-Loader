import {
    Chart as ChartJS,
    RadialLinearScale,
    ArcElement,
    Tooltip,
    Legend,
  } from 'chart.js';
  import { PolarArea } from 'react-chartjs-2';
  import { type CategoriaResumenMesDTO } from '../../types/finance';
  
  // Registrar los módulos de Chart.js
  ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);
  
  interface Props {
    data: CategoriaResumenMesDTO[];
  }
  
  export const CategoryPolarChart = ({ data }: Props) => {
    // Solo graficamos las categorías que tengan algún gasto
    const categoriasConGasto = data.filter(c => c.montoTotalDolar > 0);
  
    if (categoriasConGasto.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 12H4M8 16l-4-4 4-4" />
          </svg>
          <p className="text-sm font-medium">No hay gastos registrados en este periodo</p>
        </div>
      );
    }
  
    const chartData = {
      labels: categoriasConGasto.map(c => c.nombre),
      datasets: [
        {
          label: 'Gasto (USD)',
          data: categoriasConGasto.map(c => c.montoTotalDolar),
          // Agregamos '80' al final del HEX para darle 50% de transparencia (Alpha)
          backgroundColor: categoriasConGasto.map(c => `${c.color}80`), 
          borderColor: categoriasConGasto.map(c => c.color),
          borderWidth: 2,
        },
      ],
    };
  
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          ticks: { display: false }, // Oculta los números del eje radial para un look más limpio
          grid: { color: '#f1f5f9' }
        }
      },
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: { family: "'Inter', sans-serif", size: 12 }
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context: any) => {
              const value = context.raw || 0;
              return ` $${value.toFixed(2)} USD`;
            }
          }
        }
      }
    };
  
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <PolarArea data={chartData} options={options} />
      </div>
    );
  };