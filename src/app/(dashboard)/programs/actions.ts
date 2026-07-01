"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const programSchema = z.object({
  departmentId: z.string().uuid("Invalid department"),
  code: z.string().min(2).max(20).toUpperCase(),
  name: z.string().min(2).max(100),
  level: z.enum(["BS", "MS", "PHD"]),
  durationYears: z.coerce.number().int().min(1).max(6),
  totalCredits: z.coerce.number().int().min(30).max(200),
});

export async function createProgram(
  data: z.infer<typeof programSchema>
): Promise<{ success: true } | { error: string }> {
  try {
    const parsed = programSchema.parse(data);
    await prisma.program.create({
      data: {
        departmentId: parsed.departmentId,
        code: parsed.code,
        name: parsed.name,
        level: parsed.level,
        durationYears: parsed.durationYears,
        totalCredits: parsed.totalCredits,
      },
    });
    revalidatePath("/programs");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { error: "A program with this code already exists." };
    }
    return { error: err?.message ?? "Failed to create program." };
  }
}

export async function updateProgram(
  id: string,
  data: z.infer<typeof programSchema> & { isActive: boolean }
): Promise<{ success: true } | { error: string }> {
  try {
    const parsed = programSchema.parse(data);
    await prisma.program.update({
      where: { id },
      data: {
        departmentId: parsed.departmentId,
        code: parsed.code,
        name: parsed.name,
        level: parsed.level,
        durationYears: parsed.durationYears,
        totalCredits: parsed.totalCredits,
        isActive: data.isActive,
      },
    });
    revalidatePath("/programs");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { error: "A program with this code already exists." };
    }
    return { error: err?.message ?? "Failed to update program." };
  }
}

export async function deleteProgram(
  id: string
): Promise<{ success: true } | { error: string }> {
  try {
    const program = await prisma.program.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } },
    });
    if (!program) return { error: "Program not found." };
    if (program._count.students > 0) {
      return {
        error: `Cannot delete: this program has ${program._count.students} student(s) enrolled.`,
      };
    }
    await prisma.program.delete({ where: { id } });
    revalidatePath("/programs");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Failed to delete program." };
  }
}
