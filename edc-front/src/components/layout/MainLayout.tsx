import { Link, Outlet, useLocation } from "react-router-dom";

export const MainLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "En Vivo", icon: "⚡" },
    { path: "/historial", label: "Visión General", icon: "📊" },
    { path: "/cargar", label: "Cargar Archivos", icon: "📁" },
    { path: "/divisas", label: "Valor Dolar", icon: "💵" },
    { path: "/categorias", label: "Categorías", icon: "🏷️" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* SIDEBAR LATERAL FIJO */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="text-xl font-black text-slate-900 tracking-tight">EDC<span className="text-blue-600">Pro</span></span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER STICKY SUPERIOR */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <div className="font-medium text-slate-800">
            {navItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
          </div>
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
               AH
             </div>
          </div>
        </header>

        {/* CONTENIDO DESPLAZABLE (PÁGINAS) */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet /> {/* Aquí se renderizarán tus páginas según la ruta */}
        </main>
      </div>
      
    </div>
  );
};