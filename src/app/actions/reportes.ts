"use server";

import prisma from "@/lib/prisma";

export async function getReporteData() {
  const alumnos = await prisma.alumno.findMany({
    include: {
      grupos: { include: { grupo: true } },
      asistencias: true,
    },
    orderBy: { nombre: "asc" }
  });

  const sesiones = await prisma.sesion.findMany({
    include: {
      grupoCurso: {
        include: { grupo: true, curso: true }
      },
      leccion: true,
      asistencias: true,
    },
    orderBy: { fechaSesion: "desc" }
  });

  const grupoCursos = await prisma.grupoCurso.findMany({
    include: {
      grupo: true,
      curso: {
        include: { _count: { select: { lecciones: true } } }
      },
      sesiones: true
    }
  });

  return { alumnos, sesiones, grupoCursos };
}
