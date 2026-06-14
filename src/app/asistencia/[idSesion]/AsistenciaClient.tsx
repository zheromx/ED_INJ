"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateAsistenciasBulk } from "@/app/actions/asistencia";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Save, ArrowLeft } from "lucide-react";

export function AsistenciaClient({ sesion }: { sesion: any }) {
  const router = useRouter();
  
  // Initialize state with the asistencias array
  const [asistencias, setAsistencias] = useState<any[]>(
    sesion.asistencias.map((a: any) => ({
      id: a.id,
      alumno: a.alumno,
      asistio: a.asistio,
      trajoBiblia: a.trajoBiblia,
      capitulosLeidos: a.capitulosLeidos || "",
      diasAyuno: a.diasAyuno || "",
      visitasRealizadas: a.visitasRealizadas || "",
      observaciones: a.observaciones || "",
    }))
  );

  const [isSaving, setIsSaving] = useState(false);

  const updateRow = (id: number, field: string, value: any) => {
    setAsistencias((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const dataToSave = asistencias.map(a => ({
        id: a.id,
        asistio: a.asistio,
        trajoBiblia: a.trajoBiblia,
        capitulosLeidos: a.capitulosLeidos !== "" ? parseInt(a.capitulosLeidos) : undefined,
        diasAyuno: a.diasAyuno !== "" ? parseInt(a.diasAyuno) : undefined,
        visitasRealizadas: a.visitasRealizadas !== "" ? parseInt(a.visitasRealizadas) : undefined,
        observaciones: a.observaciones !== "" ? a.observaciones : undefined,
      }));

      await updateAsistenciasBulk(sesion.id, dataToSave);
      toast.success("Asistencia guardada correctamente");
    } catch (error) {
      toast.error("Error al guardar asistencia");
    } finally {
      setIsSaving(false);
    }
  };

  const registradosCount = asistencias.filter(a => a.asistio).length;

  return (
    <div className="space-y-6">
      <div className="bg-background p-6 rounded-lg border shadow-sm flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">{sesion.grupoCurso.grupo.nombreGrupo} - {sesion.grupoCurso.curso.nombreCurso}</h3>
          <p className="text-muted-foreground text-sm">
            Fecha: {format(new Date(sesion.fechaSesion), "dd/MM/yyyy")} • Lección #{sesion.leccion.numeroLeccion}: {sesion.leccion.titulo}
          </p>
          <p className="text-muted-foreground text-sm">
            Impartió: {sesion.maestro.nombreCompleto}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">{registradosCount}</span> de <span className="font-medium">{asistencias.length}</span> asistieron
          </div>
          <Button variant="outline" onClick={() => router.push("/sesiones")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </Button>
          <Button onClick={handleSaveAll} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" /> {isSaving ? "Guardando..." : "Guardar Todo"}
          </Button>
        </div>
      </div>

      <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead className="text-center">Asistió</TableHead>
              <TableHead className="text-center">Trajo Biblia</TableHead>
              <TableHead className="w-24">Cap. Leídos</TableHead>
              <TableHead className="w-24">Días Ayuno</TableHead>
              <TableHead className="w-24">Visitas</TableHead>
              <TableHead>Observaciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {asistencias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  No hay alumnos en este grupo.
                </TableCell>
              </TableRow>
            ) : (
              asistencias.map((a) => (
                <TableRow key={a.id} className={a.asistio ? "bg-muted/20" : ""}>
                  <TableCell className="font-medium">
                    {a.alumno.nombre} {a.alumno.apellidoPaterno}
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={a.asistio} 
                      onCheckedChange={(val) => updateRow(a.id, "asistio", val)} 
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={a.trajoBiblia} 
                      onCheckedChange={(val) => updateRow(a.id, "trajoBiblia", val)} 
                      disabled={!a.asistio}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="0"
                      className="h-8"
                      value={a.capitulosLeidos} 
                      onChange={(e) => updateRow(a.id, "capitulosLeidos", e.target.value)} 
                      disabled={!a.asistio}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="0"
                      className="h-8"
                      value={a.diasAyuno} 
                      onChange={(e) => updateRow(a.id, "diasAyuno", e.target.value)} 
                      disabled={!a.asistio}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="0"
                      className="h-8"
                      value={a.visitasRealizadas} 
                      onChange={(e) => updateRow(a.id, "visitasRealizadas", e.target.value)} 
                      disabled={!a.asistio}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      className="h-8"
                      value={a.observaciones} 
                      onChange={(e) => updateRow(a.id, "observaciones", e.target.value)} 
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
