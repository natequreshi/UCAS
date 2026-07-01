"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const deptSchema = z.object({
  code: z.string().min(1).max(10).toUpperCase(),
  name: z.string().min(2).max(100),
  abbreviation: z.string().max(10).optional(),
});

export async function createDepartment(
  data: z.infer<typeof deptSchema>
): Promise<{ success: true } | { error: string }> {
  try {
    const parsed = deptSchema.parse(data);
    await prisma.department.create({
      data: {
        code: parsed.code,
        name: parsed.name,
        abbreviation: parsed.abbreviation ?? null,
      },
    });
    revalidatePath("/departments");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { error: "A department with this code already exists." };
    }
    return { error: err?.message ?? "Failed to create department." };
  }
}

export async function updateDepartment(
  id: string,
  data: z.infer<typeof deptSchema> & { isActive: boolean }
): Promise<{ success: true } | { error: string }> {
  try {
    const parsed = deptSchema.parse(data);
    await prisma.department.update({
      where: { id },
      data: {
        code: parsed.code,
        name: parsed.name,
        abbreviation: parsed.abbreviation ?? null,
        isActive: data.isActive,
      },
    });
    revalidatePath("/departments");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { error: "A department with this code already exists." };
    }
    return { error: err?.message ?? "Failed to update department." };
  }
}

export async function deleteDepartment(
  id: string
): Promise<{ success: true } | { error: string }> {
  try {
    const dept = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: { select: { programs: true, teachers: true } },
      },
    });
    if (!dept) return { error: "Department not found." };
    if (dept._count.programs > 0) {
      return {
        error: `Cannot delete: this department has ${dept._count.programs} program(s). Remove them first.`,
      };
    }
    if (dept._count.teachers > 0) {
      return {
        error: `Cannot delete: this department has ${dept._count.teachers} teacher(s) assigned.`,
      };
    }
    await prisma.department.delete({ where: { id } });
    revalidatePath("/departments");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Failed to delete department." };
  }
}
