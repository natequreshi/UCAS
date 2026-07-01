"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── Fetch published solution for the current semester ──────────────────────
export async function getScheduleData(semesterId?: string) {
  const sem = semesterId
    ? await prisma.academicSemester.findUnique({ where: { id: semesterId } })
    : await prisma.academicSemester.findFirst({ where: { isCurrent: true } });

  if (!sem) return { semester: null, sections: [], assignments: [], rooms: [], teachers: [], timePatterns: [], solution: null };

  let solution = await prisma.scheduleSolution.findFirst({
    where: { semesterId: sem.id, status: { in: ["PUBLISHED", "DRAFT"] } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  if (!solution) {
    solution = await prisma.scheduleSolution.create({
      data: { semesterId: sem.id, name: `${sem.name} — Draft`, status: "DRAFT" },
    });
  }

  const sections = await prisma.section.findMany({
    where: { semesterId: sem.id, isActive: true },
    include: {
      course: { select: { id: true, code: true, name: true, creditHours: true, hasLab: true, category: true } },
      program: { select: { id: true, code: true, name: true } },
    },
    orderBy: [{ semesterNumber: "asc" }, { sectionCode: "asc" }],
  });

  const assignments = await prisma.assignment.findMany({
    where: { solutionId: solution.id },
    include: {
      section: {
        include: { course: { select: { id: true, code: true, name: true, creditHours: true } } },
      },
      instructor: { include: { user: { select: { name: true } } } },
      room: { select: { id: true, code: true, name: true, capacity: true, roomType: true } },
      timePattern: true,
    },
  });

  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    include: { building: { select: { code: true, name: true } } },
    orderBy: { code: "asc" },
  });

  const teachers = await prisma.teacher.findMany({
    where: { isActive: true },
    include: { user: { select: { name: true } } },
    orderBy: { employeeCode: "asc" },
  });

  const timePatterns = await prisma.timePattern.findMany({
    where: { semesterId: sem.id, isActive: true },
    orderBy: [{ daysCode: "asc" }, { slot: "asc" }],
  });

  return { semester: sem, sections, assignments, rooms, teachers, timePatterns, solution };
}

// ── Assign a section ──────────────────────────────────────────────────────
export async function assignSection(data: {
  solutionId: string;
  sectionId: string;
  timePatternId: string;
  slot: number;
  daysCode: number;
  roomId: string;
  instructorId: string;
}) {
  const roomClash = await prisma.assignment.findFirst({
    where: { solutionId: data.solutionId, roomId: data.roomId, slot: data.slot, sectionId: { not: data.sectionId } },
  });
  const teacherClash = await prisma.assignment.findFirst({
    where: { solutionId: data.solutionId, instructorId: data.instructorId, slot: data.slot, sectionId: { not: data.sectionId } },
  });

  const clashes: string[] = [];
  if (roomClash) clashes.push("Room already booked at this time");
  if (teacherClash) clashes.push("Teacher already assigned at this time");
  if (clashes.length) return { error: clashes.join("; ") };

  await prisma.assignment.deleteMany({ where: { solutionId: data.solutionId, sectionId: data.sectionId } });

  const assignment = await prisma.assignment.create({
    data: {
      solutionId: data.solutionId,
      sectionId: data.sectionId,
      timePatternId: data.timePatternId,
      slot: data.slot,
      daysCode: data.daysCode,
      roomId: data.roomId,
      instructorId: data.instructorId,
    },
    include: {
      section: { include: { course: { select: { code: true, name: true, creditHours: true } } } },
      instructor: { include: { user: { select: { name: true } } } },
      room: true,
      timePattern: true,
    },
  });

  revalidatePath("/schedule");
  return { assignment };
}

// ── Remove an assignment ──────────────────────────────────────────────────
export async function unassignSection(assignmentId: string) {
  await prisma.assignment.delete({ where: { id: assignmentId } });
  revalidatePath("/schedule");
  return { ok: true };
}

// ── Publish solution ──────────────────────────────────────────────────────
export async function publishSolution(solutionId: string) {
  const sol = await prisma.scheduleSolution.findUnique({ where: { id: solutionId } });
  if (!sol) return { error: "Solution not found" };

  await prisma.scheduleSolution.updateMany({
    where: { semesterId: sol.semesterId, status: "PUBLISHED" },
    data: { status: "ARCHIVED" },
  });
  await prisma.scheduleSolution.update({
    where: { id: solutionId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  revalidatePath("/schedule");
  return { ok: true };
}

// ── Get all semesters (for switcher) ──────────────────────────────────────
export async function getSemesters() {
  return prisma.academicSemester.findMany({
    where: { isActive: true },
    orderBy: [{ year: "desc" }, { semesterType: "asc" }],
    select: { id: true, code: true, name: true, isCurrent: true },
  });
}
