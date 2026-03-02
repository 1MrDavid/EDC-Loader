interface Props {
  onClick: () => void;
}

export const AddAccountCard = ({ onClick }: Props) => {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer group text-slate-400 hover:text-slate-600"
    >
      <div className="p-3 bg-white rounded-full group-hover:bg-slate-100 mb-2 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <span className="font-semibold text-sm">Agregar Cuenta</span>
    </div>
  );
};