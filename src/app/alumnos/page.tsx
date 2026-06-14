import { getAlumnos } from "@/app/actions/alumnos";
import { AlumnosClient } from "./AlumnosClient";

export default async function AlumnosPage() {
  const alumnos = await getAlumnos();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Alumnos</h2>
        <p className="text-muted-foreground">Administra el catálogo de alumnos.</p>
      </div>
      <AlumnosClient initialData={alumnos} />
    </div>
  );
}
