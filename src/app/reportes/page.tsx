import { getReporteData } from "@/app/actions/reportes";
import { ReportesClient } from "./ReportesClient";

export const dynamic = "force-dynamic";
export default async function ReportesPage() {
  const data = await getReporteData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Reportes</h2>
        <p className="text-muted-foreground">Analiza la información académica y de asistencia.</p>
      </div>
      <ReportesClient
        alumnos={data.alumnos}
        sesiones={data.sesiones}
        grupoCursos={data.grupoCursos}
      />
    </div>
  );
}
