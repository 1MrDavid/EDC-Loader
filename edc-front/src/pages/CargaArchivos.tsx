import { useState, type ChangeEvent, type FormEvent } from "react";
import { useCuentas } from "../hooks/useCuentas"; // Reutilizamos tu hook existente
import { subirEstadoCuenta } from "../services/uploadService";
import { type CargaArchivoResponseDTO } from "../types/finance";
import { Header } from "../components/layout/Header";

export const CargaArchivos = () => {
  const { data: cuentas, isLoading: loadingCuentas } = useCuentas();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCuentaId, setSelectedCuentaId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [resultado, setResultado] = useState<CargaArchivoResponseDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setResultado(null); // Limpiar resultado previo
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedCuentaId) return;

    const cuentaSeleccionada = cuentas?.find(c => c.id === Number(selectedCuentaId));

    if (!cuentaSeleccionada) {
      setError("Error: No se pudo identificar el banco de la cuenta seleccionada.");
      return;
    }

    const nombreBanco = cuentaSeleccionada.cuenta;

    setUploading(true);
    setResultado(null);
    setError(null);

    try {
      const response = await subirEstadoCuenta(selectedFile, Number(selectedCuentaId), nombreBanco);
      setResultado(response);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al intentar subir el archivo. Verifique el formato.");
    } finally {
      setUploading(false);
    }
  };

  console.log("Cuentas disponibles:", cuentas);

  return (
    <>
    <Header />
    <div className="bg-slate-50 min-h-screen p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Cargar Estado de Cuenta</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Selector de Cuenta */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Seleccionar Cuenta Bancaria</label>
            <select
              value={selectedCuentaId}
              onChange={(e) => setSelectedCuentaId(e.target.value)}
              disabled={loadingCuentas}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              required
            >
              <option value="">-- Seleccione una cuenta --</option>
              {cuentas?.map((c) => (
                <option key={c.numero} value={c.id}> 
                  {c.cuenta} - {c.numero}
                </option>
              ))}
            </select>
            {loadingCuentas && <p className="text-xs text-gray-400 mt-1">Cargando cuentas...</p>}
          </div>

          {/* Input de Archivo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Archivo (.txt, .csv, .xls)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
              <input 
                type="file" 
                onChange={handleFileChange} 
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                accept=".txt,.csv,.xlsx" // Ajusta según lo que soporte tu back
              />
              {selectedFile && <p className="mt-2 text-sm text-green-600 font-medium">Seleccionado: {selectedFile.name}</p>}
            </div>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={uploading || !selectedFile || !selectedCuentaId}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
              uploading || !selectedFile || !selectedCuentaId
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-slate-900 hover:bg-slate-800 shadow-md hover:shadow-lg"
            }`}
          >
            {uploading ? "Procesando archivo..." : "Subir y Procesar"}
          </button>
        </form>

        {/* Feedback de Respuesta */}
        {resultado && (
          <div className={`mt-6 p-4 rounded-lg border ${resultado.estado === 'PROCESADO' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-3">
              <span className="text-xl">{resultado.estado === 'PROCESADO' ? '✅' : '❌'}</span>
              <div>
                <h3 className={`font-bold ${resultado.estado === 'PROCESADO' ? 'text-emerald-800' : 'text-red-800'}`}>
                  {resultado.estado === 'PROCESADO' ? 'Carga Exitosa' : 'Error en la Carga'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">{resultado.mensaje}</p>
                <p className="text-xs text-slate-400 mt-2">Archivo: {resultado.nombreArchivo}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
           <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
             {error}
           </div>
        )}

      </div>
    </div>
    </>
  );
};