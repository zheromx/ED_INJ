import { getAlumnoGrupos, getGrupoCursos } from "@/app/actions/asignaciones";
import { getAlumnos } from "@/app/actions/alumnos";
import { getGrupos } from "@/app/actions/grupos";
import { getCursos } from "@/app/actions/cursos";
import { AsignacionesClient } from "./AsignacionesClient";

export const dynamic = "force-dynamic";
export default async function AsignacionesPage(props: { searchParams?: Promise<{ tab?: string; grupoId?: string }> }) {
  const searchParams = await props.searchParams;
  const defaultTab = searchParams?.tab || "alumnos";
  const defaultGrupoId = searchParams?.grupoId;

  const [alumnoGrupos, grupoCursos, alumnos, grupos, cursos] = await Promise.all([
    getAlumnoGrupos(),
    getGrupoCursos(),
    getAlumnos(),
    getGrupos(),
    getCursos(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Asignaciones</h2>
        <p className="text-muted-foreground">Asigna alumnos a grupos y cursos a grupos.</p>
      </div>
      <AsignacionesClient
        alumnoGrupos={alumnoGrupos}
        grupoCursos={grupoCursos}
        alumnos={alumnos}
        grupos={grupos}
        cursos={cursos}
        defaultTab={defaultTab}
        defaultGrupoId={defaultGrupoId}
      />
    </div>
  );
}
