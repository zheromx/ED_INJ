"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createSesion, updateSesion, deleteSesion } from "@/app/actions/sesiones";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, CheckSquare, Edit2 } from "lucide-react";

const formSchema = z.object({
  grupoCursoId: z.string().min(1, "Seleccione un grupo-curso"),
  leccionId: z.string().min(1, "Seleccione una lección"),
  fechaSesion: z.string().min(1, "Seleccione una fecha"),
  maestroImpartioId: z.string().min(1, "Seleccione un maestro"),
  ofrenda: z.coerce.number().nonnegative().optional(),
  observaciones: z.string().optional(),
});

export function SesionesClient({
  initialData,
  grupoCursos,
  lecciones,
  maestros,
}: any) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grupoCursoId: "",
      leccionId: "",
      fechaSesion: new Date().toISOString().split("T")[0],
      maestroImpartioId: "",
      ofrenda: undefined,
      observaciones: "",
    },
  });

  const selectedGrupoCursoId = form.watch("grupoCursoId");
  const selectedGC = grupoCursos.find((gc: any) => gc.id.toString() === selectedGrupoCursoId);
  const leccionesFiltradas = selectedGC
    ? lecciones.filter((l: any) => l.cursoId === selectedGC.cursoId)
    : [];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        grupoCursoId: parseInt(values.grupoCursoId),
        leccionId: parseInt(values.leccionId),
        fechaSesion: new Date(values.fechaSesion),
        maestroImpartioId: parseInt(values.maestroImpartioId),
        ofrenda: values.ofrenda,
        observaciones: values.observaciones,
      };
      if (editingId) {
        await updateSesion(editingId, payload);
        toast.success("Sesión actualizada correctamente");
      } else {
        await createSesion(payload);
        toast.success("Sesión registrada. Puedes pasar lista ahora.");
      }
      setIsDialogOpen(false);
      setEditingId(null);
      form.reset({
        grupoCursoId: "",
        leccionId: "",
        fechaSesion: new Date().toISOString().split("T")[0],
        maestroImpartioId: "",
        ofrenda: undefined,
        observaciones: "",
      });
    } catch (error) {
      toast.error("Error al guardar sesión");
    }
  };

  const handleEdit = (sesion: any) => {
    setEditingId(sesion.id);
    form.reset({
      grupoCursoId: sesion.grupoCursoId.toString(),
      leccionId: sesion.leccionId.toString(),
      fechaSesion: new Date(sesion.fechaSesion).toISOString().split("T")[0],
      maestroImpartioId: sesion.maestroImpartioId.toString(),
      ofrenda: sesion.ofrenda ?? undefined,
      observaciones: sesion.observaciones ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Eliminar sesión y todas las asistencias registradas?")) {
      try {
        await deleteSesion(id);
        toast.success("Sesión eliminada");
      } catch (error) {
        toast.error("Error al eliminar");
      }
    }
  };

  return (
    <div className="space-y-4 bg-background p-6 rounded-lg border shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Historial de Sesiones</h3>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingId(null); }}>
          <DialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" /> Registrar Sesión</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Sesión" : "Nueva Sesión"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="grupoCursoId"
                  render={({ field }) => {
                    const selectedGC = grupoCursos.find((gc: any) => gc.id.toString() === field.value);
                    const label = selectedGC ? `${selectedGC.grupo.nombreGrupo} - ${selectedGC.curso.nombreCurso}` : undefined;
                    return (
                      <FormItem>
                        <FormLabel>Grupo - Curso *</FormLabel>
                        <Select onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("leccionId", "");
                        }} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full whitespace-normal h-auto min-h-8 py-1.5">
                              <SelectValue placeholder="Seleccionar">{label}</SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {grupoCursos.map((gc: any) => (
                              <SelectItem key={gc.id} value={gc.id.toString()}>
                                {gc.grupo.nombreGrupo} - {gc.curso.nombreCurso}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="leccionId"
                  render={({ field }) => {
                    const selectedL = leccionesFiltradas.find((l: any) => l.id.toString() === field.value);
                    const labelL = selectedL ? `#${selectedL.numeroLeccion}: ${selectedL.titulo}` : undefined;
                    return (
                      <FormItem>
                        <FormLabel>Lección *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedGrupoCursoId}>
                          <FormControl>
                            <SelectTrigger className="w-full whitespace-normal h-auto min-h-8 py-1.5">
                              <SelectValue placeholder="Seleccionar Lección">{labelL}</SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {leccionesFiltradas.map((l: any) => (
                              <SelectItem key={l.id} value={l.id.toString()}>
                                #{l.numeroLeccion}: {l.titulo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fechaSesion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha *</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maestroImpartioId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Impartió *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Maestro" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {maestros.map((m: any) => (
                              <SelectItem key={m.id} value={m.nombreCompleto}>{m.nombreCompleto}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="ofrenda"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ofrenda ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl><Textarea placeholder="Notas de la sesión..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Guardar Sesión</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Grupo / Curso</TableHead>
              <TableHead>Lección</TableHead>
              <TableHead>Maestro</TableHead>
              <TableHead>Ofrenda</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24">No hay sesiones registradas.</TableCell></TableRow>
            ) : (
              initialData.map((sesion: any) => (
                <TableRow key={sesion.id}>
                  <TableCell>{format(new Date(sesion.fechaSesion), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <div className="font-medium">{sesion.grupoCurso.grupo.nombreGrupo}</div>
                    <div className="text-xs text-muted-foreground">{sesion.grupoCurso.curso.nombreCurso}</div>
                  </TableCell>
                  <TableCell>#{sesion.leccion.numeroLeccion}: {sesion.leccion.titulo}</TableCell>
                  <TableCell>{sesion.maestro.nombreCompleto}</TableCell>
                  <TableCell>{sesion.ofrenda != null ? `$${sesion.ofrenda.toFixed(2)}` : "-"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="default" size="sm" onClick={() => router.push(`/asistencia/${sesion.id}`)}>
                      <CheckSquare className="h-4 w-4 mr-2" /> Pasar Lista
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit(sesion)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(sesion.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
