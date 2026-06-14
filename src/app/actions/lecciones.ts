"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLecciones() {
  return prisma.leccion.findMany({
    include: {
      curso: true,
    },
    orderBy: [
      { cursoId: "asc" },
      { numeroLeccion: "asc" },
    ],
  });
}

export async function createLeccion(data: {
  cursoId: number;
  numeroLeccion: number;
  titulo: string;
  descripcion?: string;
}) {
  const result = await prisma.leccion.create({
    data,
  });
  revalidatePath("/lecciones");
  revalidatePath("/cursos"); // Update the count in cursos
  return result;
}

export async function updateLeccion(
  id: number,
  data: {
    cursoId: number;
    numeroLeccion: number;
    titulo: string;
    descripcion?: string;
  }
) {
  const result = await prisma.leccion.update({
    where: { id },
    data,
  });
  revalidatePath("/lecciones");
  return result;
}

export async function deleteLeccion(id: number) {
  const result = await prisma.leccion.delete({
    where: { id },
  });
  revalidatePath("/lecciones");
  revalidatePath("/cursos");
  return result;
}
