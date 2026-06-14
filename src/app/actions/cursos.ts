"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCursos() {
  return prisma.curso.findMany({
    where: { activo: true },
    include: {
      _count: {
        select: { lecciones: true },
      },
    },
    orderBy: { nombreCurso: "asc" },
  });
}

export async function createCurso(data: {
  nombreCurso: string;
  descripcion?: string;
}) {
  const result = await prisma.curso.create({
    data,
  });
  revalidatePath("/cursos");
  return result;
}

export async function updateCurso(
  id: number,
  data: {
    nombreCurso: string;
    descripcion?: string;
  }
) {
  const result = await prisma.curso.update({
    where: { id },
    data,
  });
  revalidatePath("/cursos");
  return result;
}

export async function deleteCurso(id: number) {
  const result = await prisma.curso.update({
    where: { id },
    data: { activo: false },
  });
  revalidatePath("/cursos");
  return result;
}
