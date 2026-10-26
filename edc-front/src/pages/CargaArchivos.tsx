import { useState, type ChangeEvent, type FormEvent } from "react";
import { useCuentas } from "../hooks/useCuentas"; // Reutilizamos tu hook existente
import { subirEstadoCuenta } from "../services/uploadService";
import { type CargaArchivoResponseDTO } from "../types/finance";
import { AlertCircle, CheckCircle2, UploadCloud, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SELECT_CLASS =
  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

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
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cargar Estado de Cuenta</CardTitle>
          <CardDescription>Sube tu archivo .txt, .csv o .xlsx para procesar movimientos.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Seleccionar Cuenta Bancaria</label>
              <select
                value={selectedCuentaId}
                onChange={(e) => setSelectedCuentaId(e.target.value)}
                disabled={loadingCuentas}
                className={SELECT_CLASS}
                required
              >
                <option value="">-- Seleccione una cuenta --</option>
                {cuentas?.map((c) => (
                  <option key={c.numero} value={c.id}> 
                    {c.cuenta} - {c.numero}
                  </option>
                ))}
              </select>
              {loadingCuentas && <p className="mt-1 text-xs text-muted-foreground">Cargando cuentas...</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Archivo (.txt, .csv, .xls)</label>
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:bg-muted/50">
                <UploadCloud className="mb-2 size-8 text-muted-foreground" />
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  className="w-full max-w-xs cursor-pointer text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                  accept=".txt,.csv,.xlsx"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Seleccionado: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={uploading || !selectedFile || !selectedCuentaId}
            >
              {uploading ? "Procesando archivo..." : "Subir y Procesar"}
            </Button>
          </form>

          {resultado && (
            <div
              className={`mt-6 flex items-start gap-3 rounded-lg border p-4 ${
                resultado.estado === "PROCESADO"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-destructive/20 bg-destructive/10 text-destructive"
              }`}
            >
              {resultado.estado === "PROCESADO" ? (
                <CheckCircle2 className="size-5 shrink-0" />
              ) : (
                <XCircle className="size-5 shrink-0" />
              )}
              <div>
                <h3 className="font-bold">
                  {resultado.estado === "PROCESADO" ? "Carga Exitosa" : "Error en la Carga"}
                </h3>
                <p className="mt-1 text-sm">{resultado.mensaje}</p>
                <p className="mt-2 text-xs opacity-80">Archivo: {resultado.nombreArchivo}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="size-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
