interface Props {
  onClick: () => void;
}

export const AddAccountCard = ({ onClick }: Props) => {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer group text-muted-foreground hover:text-foreground"
    >
      <div className="p-3 bg-background rounded-full group-hover:bg-background mb-2 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <span className="font-semibold text-sm">Agregar Cuenta</span>
    </div>
  );
};
