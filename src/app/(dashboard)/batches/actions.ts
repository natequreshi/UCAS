"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const batchSchema = z.object({
  prefix: z.string().min(2, "Prefix must be at least 2 characters").max(5),
  label: z.string().min(2, "Label must be at least 2 characters"),
  year: z.coerce.number().int().min(2015).max(2040),
  semesterType: z.enum(["FALL", "SPRING"]),
});

export async function createBatch(
  data: z.infer<typeof batchSchema>
): Promise<{ success: true } | { error: string }> {
  try {
    const parsed = batchSchema.parse(data);
    await prisma.batch.create({
      data: {
        prefix: parsed.prefix.toUpperCase(),
        label: parsed.label,
        year: parsed.year,
        semesterType: parsed.semesterType,
      },
    });
    revalidatePath("/batches");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { error: "A batch with this prefix already exists." };
    }
    return { error: err?.message ?? "Failed to create batch." };
  }
}

export async function updateBatch(
  id: string,
  data: z.infer<typeof batchSchema> & { isActive: boolean }
): Promise<{ success: true } | { error: string }> {
  try {
    const parsed = batchSchema.parse(data);
    await prisma.batch.update({
      where: { id },
      data: {
        prefix: parsed.prefix.toUpperCase(),
        label: parsed.label,
        year: parsed.year,
        semesterType: parsed.semesterType,
        isActive: data.isActive,
      },
    });
    revalidatePath("/batches");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { error: "A batch with this prefix already exists." };
    }
    return { error: err?.message ?? "Failed to update batch." };
  }
}

export async function deleteBatch(
  id: string
): Promise<{ success: true } | { error: string }> {
  try {
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } },
    });
    if (!batch) return { error: "Batch not found." };
    if (batch._count.students > 0) {
      return {
        error: `Cannot delete: this batch has ${batch._count.students} student(s) enrolled.`,
      };
    }
    await prisma.batch.delete({ where: { id } });
    revalidatePath("/batches");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Failed to delete batch." };
  }
}
