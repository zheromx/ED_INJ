import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, Percent } from "lucide-react";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const [totalAlumnos, totalGrupos, totalCursos, totalSesiones] = await Promise.all([
    prisma.alumno.count({ where: { activo: true } }),
    prisma.grupo.count({ where: { activo: true } }),
    prisma.curso.count({ where: { activo: true } }),
    prisma.sesion.count(),
  ]);

  // Obtener asistencias recientes para el cálculo de porcentaje global simple
  const asistencias = await prisma.asistencia.findMany();
  const asistenciaPorcentaje =
    asistencias.length > 0
      ? Math.round(
        (asistencias.filter((a) => a.asistio).length / asistencias.length) * 100
      )
      : 0;

  const sesionesRecientes = await prisma.sesion.findMany({
    take: 5,
    orderBy: { fechaSesion: "desc" },
    include: {
      grupoCurso: {
        include: { grupo: true, curso: true },
      },
      leccion: true,
      maestro: true,
      asistencias: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alumnos Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlumnos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Grupos Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGrupos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCursos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Asistencia Promedio</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{asistenciaPorcentaje}%</div>
            <p className="text-xs text-muted-foreground">En todas las sesiones</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Últimas 5 Sesiones Registradas</CardTitle>
          </CardHeader>
          <CardContent>
            {sesionesRecientes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay sesiones registradas.</p>
            ) : (
              <div className="space-y-4">
                {sesionesRecientes.map((sesion) => {
                  const asistieron = sesion.asistencias.filter((a) => a.asistio).length;
                  const total = sesion.asistencias.length;
                  const porcentaje = total > 0 ? Math.round((asistieron / total) * 100) : 0;

                  return (
                    <div key={sesion.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-sm">
                          {sesion.grupoCurso.grupo.nombreGrupo} - {sesion.grupoCurso.curso.nombreCurso}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(sesion.fechaSesion), "dd/MM/yyyy")} • {sesion.leccion.titulo}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Impartió: {sesion.maestro.nombreCompleto}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {asistieron}/{total} asistentes
                        </p>
                        <p className="text-xs text-muted-foreground">{porcentaje}% asistencia</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Podríamos agregar la gráfica aquí usando Recharts en un Client Component */}
      </div>
    </div>
  );
}
