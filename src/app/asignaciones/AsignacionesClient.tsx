"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createAlumnoGrupo, deleteAlumnoGrupo, createGrupoCurso, updateGrupoCursoEstado } from "@/app/actions/asignaciones";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Link as LinkIcon } from "lucide-react";

const alumnoGrupoSchema = z.object({
  alumnoId: z.string().min(1, "Seleccione un alumno"),
  grupoId: z.string().min(1, "Seleccione un grupo"),
});

const grupoCursoSchema = z.object({
  cursoId: z.string().min(1, "Seleccione un curso"),
  grupoId: z.string().min(1, "Seleccione un grupo"),
  fechaInicio: z.string().min(1, "Seleccione una fecha de inicio"),
  fechaFin: z.string().optional(),
  estado: z.string().min(1, "Seleccione un estado"),
});

export function AsignacionesClient({
  alumnoGrupos,
  grupoCursos,
  alumnos,
  grupos,
  cursos,
  defaultTab,
  defaultGrupoId,
}: any) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Alumno -> Grupo Form
  const formAG = useForm<z.infer<typeof alumnoGrupoSchema>>({
    resolver: zodResolver(alumnoGrupoSchema),
    defaultValues: { alumnoId: "", grupoId: defaultGrupoId || "" },
  });

  // Curso -> Grupo Form
  const formCG = useForm<z.infer<typeof grupoCursoSchema>>({
    resolver: zodResolver(grupoCursoSchema),
    defaultValues: {
      cursoId: "",
      grupoId: defaultGrupoId || "",
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaFin: "",
      estado: "Activo",
    },
  });

  const onSubmitAG = async (values: z.infer<typeof alumnoGrupoSchema>) => {
    try {
      await createAlumnoGrupo({
        alumnoId: parseInt(values.alumnoId),
        grupoId: parseInt(values.grupoId),
      });
      toast.success("Alumno asignado al grupo");
      formAG.reset({ alumnoId: "", grupoId: values.grupoId });
    } catch (error: any) {
      toast.error(error.message || "Error al asignar alumno");
    }
  };

  const onDesasignarAlumno = async (id: number) => {
    if (confirm("¿Desasignar alumno de este grupo?")) {
      try {
        await deleteAlumnoGrupo(id);
        toast.success("Alumno desasignado");
      } catch (error) {
        toast.error("Error al desasignar");
      }
    }
  };

  const onSubmitCG = async (values: z.infer<typeof grupoCursoSchema>) => {
    try {
      await createGrupoCurso({
        grupoId: parseInt(values.grupoId),
        cursoId: parseInt(values.cursoId),
        fechaInicio: new Date(values.fechaInicio),
        fechaFin: values.fechaFin ? new Date(values.fechaFin) : undefined,
        estado: values.estado,
      });
      toast.success("Curso asignado al grupo");
      formCG.reset({
        cursoId: "",
        grupoId: values.grupoId,
        fechaInicio: values.fechaInicio,
        fechaFin: "",
        estado: "Activo"
      });
    } catch (error) {
      toast.error("Error al asignar curso");
    }
  };

  const onCambiarEstadoCurso = async (id: number, nuevoEstado: string) => {
    try {
      await updateGrupoCursoEstado(id, nuevoEstado);
      toast.success("Estado actualizado");
    } catch (error) {
      toast.error("Error al actualizar estado");
    }
  };

  return (
    <div className="bg-background p-6 rounded-lg border shadow-sm">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="alumnos">Alumnos a Grupos</TabsTrigger>
          <TabsTrigger value="cursos">Cursos a Grupos</TabsTrigger>
        </TabsList>

        {/* TAB 1: ALUMNOS A GRUPOS */}
        <TabsContent value="alumnos" className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-md border">
            <h3 className="text-sm font-semibold mb-4">Nueva Asignación</h3>
            <Form {...formAG}>
              <form onSubmit={formAG.handleSubmit(onSubmitAG)} className="flex items-end gap-4">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <FormField
                    control={formAG.control}
                    name="alumnoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alumno</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar Alumno" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {alumnos.map((a: any) => (
                              <SelectItem key={a.id} value={a.id.toString()}>
                                {a.nombre} {a.apellidoPaterno} {a.apellidoMaterno}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formAG.control}
                    name="grupoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grupo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar Grupo" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {grupos.map((g: any) => (
                              <SelectItem key={g.id} value={g.id.toString()}>{g.nombreGrupo}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit"><LinkIcon className="h-4 w-4 mr-2" /> Asignar</Button>
              </form>
            </Form>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Fecha Ingreso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumnoGrupos.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center h-24">No hay asignaciones.</TableCell></TableRow>
                ) : (
                  alumnoGrupos.map((ag: any) => (
                    <TableRow key={ag.id}>
                      <TableCell className="font-medium">{ag.grupo.nombreGrupo}</TableCell>
                      <TableCell>{ag.alumno.nombre} {ag.alumno.apellidoPaterno}</TableCell>
                      <TableCell>{format(new Date(ag.fechaIngreso), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => onDesasignarAlumno(ag.id)}>
                          <Trash2 className="h-4 w-4 text-destructive mr-2" /> Desasignar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB 2: CURSOS A GRUPOS */}
        <TabsContent value="cursos" className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-md border">
            <h3 className="text-sm font-semibold mb-4">Asignar Curso a Grupo</h3>
            <Form {...formCG}>
              <form onSubmit={formCG.handleSubmit(onSubmitCG)} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <FormField
                  control={formCG.control}
                  name="grupoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grupo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {grupos.map((g: any) => (
                            <SelectItem key={g.id} value={g.id.toString()}>{g.nombreGrupo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formCG.control}
                  name="cursoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Curso</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {cursos.map((c: any) => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.nombreCurso}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formCG.control}
                  name="fechaInicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inicio</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formCG.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Activo">Activo</SelectItem>
                          <SelectItem value="Finalizado">Finalizado</SelectItem>
                          <SelectItem value="Pausado">Pausado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit"><LinkIcon className="h-4 w-4 mr-2" /> Asignar</Button>
              </form>
            </Form>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grupoCursos.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center h-24">No hay cursos asignados a grupos.</TableCell></TableRow>
                ) : (
                  grupoCursos.map((gc: any) => (
                    <TableRow key={gc.id}>
                      <TableCell className="font-medium">{gc.grupo.nombreGrupo}</TableCell>
                      <TableCell>{gc.curso.nombreCurso}</TableCell>
                      <TableCell>{format(new Date(gc.fechaInicio), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{gc.fechaFin ? format(new Date(gc.fechaFin), "dd/MM/yyyy") : "-"}</TableCell>
                      <TableCell>
                        <Badge variant={gc.estado === "Activo" ? "default" : gc.estado === "Finalizado" ? "secondary" : "outline"}>
                          {gc.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select value={gc.estado} onValueChange={(val) => onCambiarEstadoCurso(gc.id, val)}>
                          <SelectTrigger className="w-[120px] ml-auto h-8 text-xs">
                            <SelectValue placeholder="Cambiar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Activo">Activo</SelectItem>
                            <SelectItem value="Finalizado">Finalizado</SelectItem>
                            <SelectItem value="Pausado">Pausado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
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
