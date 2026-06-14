"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMaestros() {
  return prisma.maestro.findMany({
    where: { activo: true },
    orderBy: { nombreCompleto: "asc" },
  });
}

export async function createMaestro(data: {
  nombreCompleto: string;
  telefono?: string;
  correo?: string;
}) {
  const result = await prisma.maestro.create({
    data,
  });
  revalidatePath("/maestros");
  return result;
}

export async function updateMaestro(
  id: number,
  data: {
    nombreCompleto: string;
    telefono?: string;
    correo?: string;
  }
) {
  const result = await prisma.maestro.update({
    where: { id },
    data,
  });
  revalidatePath("/maestros");
  return result;
}

export async function deleteMaestro(id: number) {
  const result = await prisma.maestro.update({
    where: { id },
    data: { activo: false },
  });
  revalidatePath("/maestros");
  return result;
}
