import { Link } from "react-router-dom"; // Asumiendo que usas react-router-dom

export const Header = () => {
  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200">
      {/* ... Logo ... */}
      
      <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
        <Link to="/" className="hover:text-black transition">Inicio</Link>
        <Link to="/cargar" className="text-black font-semibold">Cargar Archivos</Link> {/* Link activo */}
        <a href="#" className="hover:text-black transition">Reportes</a>
      </nav>

      {/* ... User info ... */}
    </header>
  );
};