"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ── Buildings ──────────────────────────────────────────────────────────────

const buildingSchema = z.object({
  code: z.string().min(1).max(20).toUpperCase(),
  name: z.string().min(2).max(100),
  abbreviation: z.string().max(10).optional(),
});

export async function createBuilding(
  data: z.infer<typeof buildingSchema>
): Promise<{ success: true } | { error: string }> {
  try {
    const parsed = buildingSchema.parse(data);
    await prisma.building.create({
      data: {
        code: parsed.code,
        name: parsed.name,
        abbreviation: parsed.abbreviation ?? null,
      },
    });
    revalidatePath("/rooms");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { error: "A building with this code already exists." };
    }
    return { error: err?.message ?? "Failed to create building." };
  }
}

export async function updateBuilding(
  id: string,
  data: z.infer<typeof buildingSchema> & { isActive: boolean }
): Promise<{ success: true } | { error: string }> {
  try {
    const parsed = buildingSchema.parse(data);
    await prisma.building.update({
      where: { id },
      data: {
        code: parsed.code,
        name: parsed.name,
        abbreviation: parsed.abbreviation ?? null,
        isActive: data.isActive,
      },
    });
    revalidatePath("/rooms");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { error: "A building with this code already exists." };
    }
    return { error: err?.message ?? "Failed to update building." };
  }
}

export async function deleteBuilding(
  id: string
): Promise<{ success: true } | { error: string }> {
  try {
    const building = await prisma.building.findUnique({
      where: { id },
      include: { _count: { select: { rooms: true } } },
    });
    if (!building) return { error: "Building not found." };
    if (building._count.rooms > 0) {
      return {
        error: `Cannot delete: this building has ${building._count.rooms} room(s). Remove them first.`,
      };
    }
    await prisma.building.delete({ where: { id } });
    revalidatePath("/rooms");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Failed to delete building." };
  }
}

// ── Rooms ──────────────────────────────────────────────────────────────────

const roomSchema = z.object({
  buildingId: z.string().uuid("Select a building"),
  code: z.string().min(1).max(20).toUpperCase(),
  name: z.string().min(2).max(100),
  capacity: z.coerce.number().int().min(1).max(1000),
  roomType: z.enum([
    "LECTURE_HALL",
    "LAB_COMPUTER",
    "LAB_PHYSICS",
    "LAB_CHEMISTRY",
    "LAB_ELECTRONICS",
    "SEMINAR_ROOM",
    "AUDITORIUM",
  ]),
  hasProjector: z.boolean().default(false),
  hasAC: z.boolean().default(false),
});

export async function createRoom(
  data: z.infer<typeof roomSchema>
): Promise<{ success: true } | { error: string }> {
  try {
    const parsed = roomSchema.parse(data);
    await prisma.room.create({
      data: {
        buildingId: parsed.buildingId,
        code: parsed.code,
        name: parsed.name,
        capacity: parsed.capacity,
        roomType: parsed.roomType,
        hasProjector: parsed.hasProjector,
        hasAC: parsed.hasAC,
      },
    });
    revalidatePath("/rooms");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { error: "A room with this code already exists." };
    }
    return { error: err?.message ?? "Failed to create room." };
  }
}

export async function updateRoom(
  id: string,
  data: z.infer<typeof roomSchema> & { isActive: boolean }
): Promise<{ success: true } | { error: string }> {
  try {
    const parsed = roomSchema.parse(data);
    await prisma.room.update({
      where: { id },
      data: {
        buildingId: parsed.buildingId,
        code: parsed.code,
        name: parsed.name,
        capacity: parsed.capacity,
        roomType: parsed.roomType,
        hasProjector: parsed.hasProjector,
        hasAC: parsed.hasAC,
        isActive: data.isActive,
      },
    });
    revalidatePath("/rooms");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { error: "A room with this code already exists." };
    }
    return { error: err?.message ?? "Failed to update room." };
  }
}

export async function deleteRoom(
  id: string
): Promise<{ success: true } | { error: string }> {
  try {
    await prisma.room.delete({ where: { id } });
    revalidatePath("/rooms");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2003") {
      return { error: "Cannot delete: this room is referenced by existing assignments." };
    }
    return { error: err?.message ?? "Failed to delete room." };
  }
}
