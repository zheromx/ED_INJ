import { getCursos } from "@/app/actions/cursos";
import { CursosClient } from "./CursosClient";

export const dynamic = "force-dynamic";
export default async function CursosPage() {
  const cursos = await getCursos();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Cursos</h2>
        <p className="text-muted-foreground">Administra el catálogo de cursos o materias.</p>
      </div>
      <CursosClient initialData={cursos} />
    </div>
  );
}
