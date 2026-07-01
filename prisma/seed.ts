import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding UCAS database...");

  // ─── Admin User ───────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ucas.edu.pk" },
    update: {},
    create: {
      email: "admin@ucas.edu.pk",
      name: "System Administrator",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
      mustChangePwd: true,
    },
  });
  console.log(`✓ Admin user: ${admin.email}`);

  // ─── Scheduling Constraints (configurable) ────────────────────────────────
  const constraints = [
    {
      constraintKey: "FRIDAY_PRAYER_START",
      label: "Friday Prayer Start",
      value: "12:30",
      description: "No classes allowed from this time on Fridays (HH:MM 24h)",
    },
    {
      constraintKey: "FRIDAY_PRAYER_END",
      label: "Friday Prayer End",
      value: "14:00",
      description: "Classes may resume after this time on Fridays (HH:MM 24h)",
    },
    {
      constraintKey: "BS_EARLIEST_START",
      label: "BS Earliest Class Start",
      value: "08:00",
      description: "Earliest allowed class start for BS programs (HH:MM 24h)",
    },
    {
      constraintKey: "BS_LATEST_END",
      label: "BS Latest Class End",
      value: "18:00",
      description: "Latest allowed class end for BS programs (HH:MM 24h)",
    },
    {
      constraintKey: "MS_LATEST_END",
      label: "MS/PhD Latest Class End",
      value: "21:00",
      description: "Latest allowed class end for MS/PhD programs (HH:MM 24h)",
    },
    {
      constraintKey: "LAB_EARLIEST_START",
      label: "Computer Lab Earliest Start",
      value: "16:00",
      description:
        "Computer lab classes can only start from this time (HH:MM 24h)",
    },
    {
      constraintKey: "LAB_LATEST_END",
      label: "Computer Lab Latest End",
      value: "19:00",
      description: "Computer lab classes must end by this time (HH:MM 24h)",
    },
    {
      constraintKey: "ALLIED_LATEST_END",
      label: "Allied Courses Latest End",
      value: "12:00",
      description:
        "Allied courses (first 4 semesters) should preferably end by noon",
    },
    {
      constraintKey: "TEACHER_FREE_DAY_REQUIRED",
      label: "Teacher Free Day Required",
      value: "true",
      description:
        "Every teacher must have at least one free day per week (no classes)",
    },
    {
      constraintKey: "STUDENT_FREE_DAY_REQUIRED",
      label: "Student Free Day Required",
      value: "true",
      description:
        "Every student must have at least one free day per week (no classes)",
    },
    {
      constraintKey: "DEFAULT_CLASS_DURATION",
      label: "Default Class Duration (minutes)",
      value: "55",
      description: "Default duration per class meeting in minutes",
    },
    {
      constraintKey: "SLOT_BREAK_MINUTES",
      label: "Break Between Classes (minutes)",
      value: "5",
      description: "Break time between consecutive classes",
    },
  ];

  for (const c of constraints) {
    await prisma.schedulingConstraint.upsert({
      where: { constraintKey: c.constraintKey },
      update: { value: c.value },
      create: { ...c, isEnabled: true },
    });
  }
  console.log(`✓ ${constraints.length} scheduling constraints seeded`);

  // ─── App Config ───────────────────────────────────────────────────────────
  const configs = [
    {
      key: "UNIVERSITY_NAME",
      value: "University of Punjab",
      label: "University Name",
    },
    {
      key: "UNIVERSITY_SHORT",
      value: "PU",
      label: "University Short Name",
    },
    {
      key: "UNIVERSITY_LOCATION",
      value: "Lahore, Pakistan",
      label: "University Location",
    },
    {
      key: "CURRENT_SEMESTER",
      value: "",
      label: "Current Active Semester ID",
    },
    {
      key: "ACADEMIC_YEAR",
      value: "2024-2025",
      label: "Current Academic Year",
    },
  ];

  for (const c of configs) {
    await prisma.appConfig.upsert({
      where: { key: c.key },
      update: { value: c.value },
      create: c,
    });
  }
  console.log(`✓ ${configs.length} app config entries seeded`);

  // ─── Sample Department & Program ─────────────────────────────────────────
  const dept = await prisma.department.upsert({
    where: { code: "CS" },
    update: {},
    create: {
      code: "CS",
      name: "Department of Computer Science",
      abbreviation: "CS",
    },
  });

  const bscs = await prisma.program.upsert({
    where: { code: "BSCS" },
    update: {},
    create: {
      departmentId: dept.id,
      code: "BSCS",
      name: "BS Computer Science",
      level: "BS",
      durationYears: 4,
      totalCredits: 130,
    },
  });
  console.log(`✓ Sample department: ${dept.code}, program: ${bscs.code}`);

  console.log("\n✅ Database seeded successfully.");
  console.log(
    "   Default admin: admin@ucas.edu.pk / Admin@123 (change on first login)"
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
