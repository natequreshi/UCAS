"use server";

import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "SCHEDULE_MANAGER",
    "DEPARTMENT_CHAIR",
    "TEACHER",
    "STUDENT",
    "VIEWER",
  ]),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "SCHEDULE_MANAGER",
    "DEPARTMENT_CHAIR",
    "TEACHER",
    "STUDENT",
    "VIEWER",
  ]),
  isActive: z.boolean(),
  mustChangePwd: z.boolean(),
});

export async function createUser(
  data: z.infer<typeof createUserSchema>
): Promise<{ success: true } | { error: string }> {
  try {
    const parsed = createUserSchema.parse(data);
    const hash = await bcrypt.hash(parsed.password, 12);
    await prisma.user.create({
      data: {
        email: parsed.email.toLowerCase().trim(),
        name: parsed.name,
        role: parsed.role,
        passwordHash: hash,
        mustChangePwd: true,
      },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { error: "A user with this email already exists." };
    }
    return { error: err?.message ?? "Failed to create user." };
  }
}

export async function updateUser(
  id: string,
  data: z.infer<typeof updateUserSchema>
): Promise<{ success: true } | { error: string }> {
  try {
    const parsed = updateUserSchema.parse(data);
    await prisma.user.update({
      where: { id },
      data: {
        name: parsed.name,
        role: parsed.role,
        isActive: parsed.isActive,
        mustChangePwd: parsed.mustChangePwd,
      },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Failed to update user." };
  }
}

export async function deleteUser(
  id: string
): Promise<{ success: true } | { error: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id === id) {
      return { error: "You cannot delete your own account." };
    }
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2003") {
      return {
        error:
          "Cannot delete: this user has associated records (teacher/student profile).",
      };
    }
    return { error: err?.message ?? "Failed to delete user." };
  }
}

export async function resetPassword(
  id: string
): Promise<{ success: true; password: string } | { error: string }> {
  try {
    const newPwd =
      Math.random().toString(36).slice(-6).toUpperCase() +
      Math.random().toString(36).slice(-4) +
      "A1!";
    const hash = await bcrypt.hash(newPwd, 12);
    await prisma.user.update({
      where: { id },
      data: { passwordHash: hash, mustChangePwd: true },
    });
    revalidatePath("/admin");
    return { success: true, password: newPwd };
  } catch (err: any) {
    return { error: err?.message ?? "Failed to reset password." };
  }
}
