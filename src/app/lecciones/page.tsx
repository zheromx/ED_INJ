import { getLecciones } from "@/app/actions/lecciones";
import { getCursos } from "@/app/actions/cursos";
import { LeccionesClient } from "./LeccionesClient";

export const dynamic = "force-dynamic";
export default async function LeccionesPage(
  props: { searchParams?: Promise<{ cursoId?: string }> }
) {
  const searchParams = await props.searchParams;
  const cursoIdParam = searchParams?.cursoId;

  const [lecciones, cursos] = await Promise.all([
    getLecciones(),
    getCursos(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Lecciones</h2>
        <p className="text-muted-foreground">Administra las lecciones de los cursos.</p>
      </div>
      <LeccionesClient initialData={lecciones} cursos={cursos} defaultCursoId={cursoIdParam} />
    </div>
  );
}
