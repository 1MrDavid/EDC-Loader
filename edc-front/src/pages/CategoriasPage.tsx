import { useEffect, useState } from "react";
import { Header } from "../components/layout/Header";
import { obtenerResumenCategorias, obtenerFechaMasReciente } from "../services/bankingService"; 
import { type CategoriaResumenMesDTO } from "../types/finance";
import { CategoryPolarChart } from "../components/charts/CategoryPolarChart";

export const CategoriasPage = () => {
  const [categorias, setCategorias] = useState<CategoriaResumenMesDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializingDate, setIsInitializingDate] = useState(true);
  
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  // 1. Efecto de Inicialización: Buscar la fecha del último movimiento
  useEffect(() => {
    const initDate = async () => {
      try {
        const maxDateStr = await obtenerFechaMasReciente(); // "YYYY-MM-DD"
        if (maxDateStr) {
          const [yyyy, mm] = maxDateStr.split('-');
          setYear(Number(yyyy));
          setMonth(Number(mm));
        }
      } catch (error) {
        console.error("Error al obtener fecha reciente", error);
      } finally {
        setIsInitializingDate(false);
      }
    };
    initDate();
  }, []);

  // 2. Efecto de Búsqueda: Buscar categorías cuando cambie mes/año
  useEffect(() => {
    if (isInitializingDate) return; // Esperar a que la fecha correcta esté seteada

    const fetchResumen = async () => {
      setIsLoading(true);
      try {
        const data = await obtenerResumenCategorias(month, year);
        setCategorias(data);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumen();
  }, [month, year, isInitializingDate]);

  return (
    <div className="bg-slate-50 min-h-screen pb-10">
      <Header />
      <main className="max-w-7xl mx-auto p-8">
        
        {/* HEADER CONTROLES */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión de Categorías</h1>
            <p className="text-slate-500 text-sm">Organiza y analiza tus flujos de dinero.</p>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <select 
                value={month} 
                onChange={(e) => setMonth(Number(e.target.value))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white font-medium"
                disabled={isInitializingDate}
              >
                {Array.from({length: 12}, (_, i) => (
                  <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('es', {month: 'long'})}</option>
                ))}
              </select>
              <select 
                value={year} 
                onChange={(e) => setYear(Number(e.target.value))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white font-medium"
                disabled={isInitializingDate}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
              + Nueva Categoría
            </button>
          </div>
        </div>

        {/* SECCIÓN DEL GRÁFICO */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 h-[380px]">
          {isLoading || isInitializingDate ? (
             <div className="h-full flex items-center justify-center text-slate-400 animate-pulse">
               Generando gráfico...
             </div>
          ) : (
            <CategoryPolarChart data={categorias} />
          )}
        </section>

        {/* GRID DE TARJETAS */}
        {isLoading || isInitializingDate ? (
          <div className="text-center py-10 text-slate-500 animate-pulse">Cargando categorías...</div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categorias.map(cat => (
              <div key={cat.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    {cat.icono}
                  </div>
                  <span className={`text-[10px] tracking-wider font-bold px-2 py-1 rounded-md ${cat.tipo === 'INGRESO' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {cat.tipo}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-800 text-lg mb-1">{cat.nombre}</h3>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Total del mes</p>
                    <p className="font-bold text-slate-700">${cat.montoTotalDolar.toFixed(2)}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                    {cat.movimientosMes} movs
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};