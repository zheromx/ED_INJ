"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ReportesClient({ alumnos, sesiones, grupoCursos }: any) {
  // --- Tab 1: Asistencia por Alumno ---
  const alumnosStats = alumnos.map((a: any) => {
    const totalSesiones = a.asistencias.length;
    const asistenciasCount = a.asistencias.filter((asist: any) => asist.asistio).length;
    const tareasCount = a.asistencias.filter((asist: any) => asist.trajoBiblia || asist.capitulosLeidos).length;
    const faltasCount = totalSesiones - asistenciasCount;
    const porcentaje = totalSesiones > 0 ? Math.round((asistenciasCount / totalSesiones) * 100) : 0;
    const porcentajeInasistencia = totalSesiones > 0 ? Math.round((faltasCount / totalSesiones) * 100) : 0;
    
    return {
      ...a,
      totalSesiones,
      asistenciasCount,
      faltasCount,
      tareasCount,
      porcentaje,
      porcentajeInasistencia,
    };
  });

  // --- Tab 4: Más Faltas ---
  const alumnosMasFaltas = [...alumnosStats]
    .filter(a => a.totalSesiones > 0)
    .sort((a, b) => b.faltasCount - a.faltasCount)
    .slice(0, 10); // Top 10

  return (
    <div className="bg-background p-6 rounded-lg border shadow-sm">
      <Tabs defaultValue="alumno">
        <TabsList className="mb-4 flex flex-wrap h-auto">
          <TabsTrigger value="alumno">Asistencia por Alumno</TabsTrigger>
          <TabsTrigger value="grupo">Asistencia por Grupo</TabsTrigger>
          <TabsTrigger value="avance">Avance de Curso</TabsTrigger>
          <TabsTrigger value="faltas">Alumnos con Más Faltas</TabsTrigger>
        </TabsList>

        <TabsContent value="alumno" className="space-y-4">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Grupo(s)</TableHead>
                  <TableHead className="text-right">Total Sesiones</TableHead>
                  <TableHead className="text-right">Asistencias</TableHead>
                  <TableHead className="text-right">% Asistencia</TableHead>
                  <TableHead className="text-right">Tareas Cumplidas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumnosStats.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.nombre} {a.apellidoPaterno}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {a.grupos.map((g: any) => g.grupo.nombreGrupo).join(", ") || "-"}
                    </TableCell>
                    <TableCell className="text-right">{a.totalSesiones}</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">{a.asistenciasCount}</TableCell>
                    <TableCell className="text-right">{a.porcentaje}%</TableCell>
                    <TableCell className="text-right">{a.tareasCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="grupo" className="space-y-4">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Lección</TableHead>
                  <TableHead className="text-right">Asistieron/Total</TableHead>
                  <TableHead className="text-right">% Asistencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sesiones.map((s: any) => {
                  const total = s.asistencias.length;
                  const asistieron = s.asistencias.filter((a: any) => a.asistio).length;
                  const porcentaje = total > 0 ? Math.round((asistieron / total) * 100) : 0;
                  return (
                    <TableRow key={s.id}>
                      <TableCell>{format(new Date(s.fechaSesion), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="font-medium">{s.grupoCurso.grupo.nombreGrupo}</TableCell>
                      <TableCell>{s.grupoCurso.curso.nombreCurso}</TableCell>
                      <TableCell>#{s.leccion.numeroLeccion}</TableCell>
                      <TableCell className="text-right">{asistieron} / {total}</TableCell>
                      <TableCell className="text-right">{porcentaje}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="avance" className="space-y-4">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead className="text-right">Lecciones Impartidas</TableHead>
                  <TableHead className="text-right">Total Lecciones</TableHead>
                  <TableHead className="text-right">% Avance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grupoCursos.map((gc: any) => {
                  const impartidas = gc.sesiones.length;
                  const total = gc.curso._count.lecciones;
                  const avance = total > 0 ? Math.round((impartidas / total) * 100) : 0;
                  return (
                    <TableRow key={gc.id}>
                      <TableCell className="font-medium">{gc.grupo.nombreGrupo}</TableCell>
                      <TableCell>{gc.curso.nombreCurso}</TableCell>
                      <TableCell className="text-right">{impartidas}</TableCell>
                      <TableCell className="text-right">{total}</TableCell>
                      <TableCell className="text-right font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${Math.min(avance, 100)}%` }} />
                          </div>
                          <span className="w-10">{avance}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="faltas" className="space-y-4">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Grupo(s)</TableHead>
                  <TableHead className="text-right">Total Faltas</TableHead>
                  <TableHead className="text-right">% Inasistencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumnosMasFaltas.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center h-24">No hay datos suficientes.</TableCell></TableRow>
                ) : (
                  alumnosMasFaltas.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.nombre} {a.apellidoPaterno}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {a.grupos.map((g: any) => g.grupo.nombreGrupo).join(", ") || "-"}
                      </TableCell>
                      <TableCell className="text-right font-bold text-destructive">{a.faltasCount}</TableCell>
                      <TableCell className="text-right">{a.porcentajeInasistencia}%</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
