"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const semSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  semesterType: z.enum(["FALL", "SPRING", "SUMMER"]),
  year: z.coerce.number().int().min(2020).max(2040),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isSummer: z.boolean().default(false),
});

export async function createSemester(
  data: z.infer<typeof semSchema>
): Promise<{ success: true } | { error: string }> {
  try {
    const parsed = semSchema.parse(data);
    await prisma.academicSemester.create({
      data: {
        code: parsed.code,
        name: parsed.name,
        semesterType: parsed.semesterType,
        year: parsed.year,
        startDate: new Date(parsed.startDate),
        endDate: new Date(parsed.endDate),
        isSummer: parsed.isSummer,
      },
    });
    revalidatePath("/semesters");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { error: "A semester with this code already exists." };
    }
    return { error: err?.message ?? "Failed to create semester." };
  }
}

export async function updateSemester(
  id: string,
  data: z.infer<typeof semSchema> & { isActive: boolean }
): Promise<{ success: true } | { error: string }> {
  try {
    const parsed = semSchema.parse(data);
    await prisma.academicSemester.update({
      where: { id },
      data: {
        code: parsed.code,
        name: parsed.name,
        semesterType: parsed.semesterType,
        year: parsed.year,
        startDate: new Date(parsed.startDate),
        endDate: new Date(parsed.endDate),
        isSummer: parsed.isSummer,
        isActive: data.isActive,
      },
    });
    revalidatePath("/semesters");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { error: "A semester with this code already exists." };
    }
    return { error: err?.message ?? "Failed to update semester." };
  }
}

export async function deleteSemester(
  id: string
): Promise<{ success: true } | { error: string }> {
  try {
    const sem = await prisma.academicSemester.findUnique({
      where: { id },
      include: { _count: { select: { sections: true, enrollments: true } } },
    });
    if (!sem) return { error: "Semester not found." };
    if (sem._count.sections > 0) {
      return {
        error: `Cannot delete: this semester has ${sem._count.sections} section(s).`,
      };
    }
    await prisma.academicSemester.delete({ where: { id } });
    revalidatePath("/semesters");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Failed to delete semester." };
  }
}

export async function setCurrentSemester(
  id: string
): Promise<{ success: true } | { error: string }> {
  try {
    await prisma.$transaction([
      prisma.academicSemester.updateMany({
        data: { isCurrent: false },
      }),
      prisma.academicSemester.update({
        where: { id },
        data: { isCurrent: true },
      }),
    ]);
    revalidatePath("/semesters");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Failed to set current semester." };
  }
}
