import { type CuentaDTO } from "../../types/finance";

interface Props {
  cuenta: CuentaDTO;
  onClick: () => void;
}

export const AccountCard = ({ cuenta, onClick }: Props) => {
  return (
    <div 
      onClick={onClick}
      className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-32"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
            {cuenta.cuenta}
          </h4>
          <p className="text-slate-400 text-xs font-mono mt-1 tracking-wide">
            {cuenta.numero}
          </p>
        </div>
        <div className="p-2 bg-slate-50 rounded-full group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-500 transition-colors">
          {/* Icono simple de flecha o banco */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      <div className="mt-auto">
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
          Ver detalles
        </span>
      </div>
    </div>
  );
};