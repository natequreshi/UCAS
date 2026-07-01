import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// slot helpers
const slot = (h: number, m = 0) => Math.floor((h * 60 + m) / 5);
const MWF = 1 + 4 + 16;   // Mon=1 Wed=4 Fri=16
const TT  = 2 + 8;         // Tue=2 Thu=8
const MW  = 1 + 4;
const TTH = 2 + 8;

async function main() {
  console.log("🌱 Seeding UCAS database...");

  // ─── Admin & Scheduling constraints ──────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@123", 10);
  await prisma.user.upsert({
    where: { email: "admin@ucas.edu.pk" },
    update: {},
    create: { email: "admin@ucas.edu.pk", name: "System Administrator", passwordHash: adminHash, role: "SUPER_ADMIN", mustChangePwd: true },
  });

  const constraints = [
    { constraintKey: "FRIDAY_PRAYER_START",    label: "Friday Prayer Start",           value: "12:30", description: "No classes allowed from this time on Fridays" },
    { constraintKey: "FRIDAY_PRAYER_END",      label: "Friday Prayer End",             value: "14:00", description: "Classes may resume after this time on Fridays" },
    { constraintKey: "BS_EARLIEST_START",      label: "BS Earliest Start",             value: "08:00", description: "Earliest BS class start" },
    { constraintKey: "BS_LATEST_END",          label: "BS Latest End",                 value: "18:00", description: "Latest BS class end" },
    { constraintKey: "MS_LATEST_END",          label: "MS Latest End",                 value: "21:00", description: "Latest MS class end" },
    { constraintKey: "LAB_EARLIEST_START",     label: "Lab Earliest Start",            value: "16:00", description: "Computer lab earliest start" },
    { constraintKey: "LAB_LATEST_END",         label: "Lab Latest End",                value: "19:00", description: "Computer lab must end by" },
    { constraintKey: "ALLIED_LATEST_END",      label: "Allied Courses Latest End",     value: "12:00", description: "Allied courses preferably end by noon" },
    { constraintKey: "TEACHER_FREE_DAY_REQUIRED", label: "Teacher Free Day Required", value: "true",  description: "Every teacher must have one free day/week" },
    { constraintKey: "STUDENT_FREE_DAY_REQUIRED", label: "Student Free Day Required", value: "true",  description: "Every student must have one free day/week" },
    { constraintKey: "DEFAULT_CLASS_DURATION", label: "Default Class Duration (min)",  value: "55",    description: "Default minutes per class meeting" },
    { constraintKey: "SLOT_BREAK_MINUTES",     label: "Break Between Classes (min)",   value: "5",     description: "Break between consecutive classes" },
  ];
  for (const c of constraints) {
    await prisma.schedulingConstraint.upsert({ where: { constraintKey: c.constraintKey }, update: { value: c.value }, create: { ...c, isEnabled: true } });
  }

  const configs = [
    { key: "UNIVERSITY_NAME",     value: "University of Punjab",  label: "University Name" },
    { key: "UNIVERSITY_SHORT",    value: "PU",                    label: "University Short Name" },
    { key: "UNIVERSITY_LOCATION", value: "Lahore, Pakistan",      label: "University Location" },
    { key: "ACADEMIC_YEAR",       value: "2024-2025",             label: "Academic Year" },
  ];
  for (const c of configs) {
    await prisma.appConfig.upsert({ where: { key: c.key }, update: {}, create: c });
  }

  // ─── Departments ──────────────────────────────────────────────────────────
  const [dCS, dSE, dIT, dMATH] = await Promise.all([
    prisma.department.upsert({ where: { code: "CS" },   update: {}, create: { code: "CS",   name: "Department of Computer Science",    abbreviation: "CS"   } }),
    prisma.department.upsert({ where: { code: "SE" },   update: {}, create: { code: "SE",   name: "Department of Software Engineering", abbreviation: "SE"   } }),
    prisma.department.upsert({ where: { code: "IT" },   update: {}, create: { code: "IT",   name: "Department of Information Technology", abbreviation: "IT" } }),
    prisma.department.upsert({ where: { code: "MATH" }, update: {}, create: { code: "MATH", name: "Department of Mathematics",          abbreviation: "Math" } }),
  ]);
  console.log("✓ 4 departments");

  // ─── Programs ─────────────────────────────────────────────────────────────
  const [pBSCS, pBSSE, pBSIT, pMSSE] = await Promise.all([
    prisma.program.upsert({ where: { code: "BSCS" }, update: {}, create: { departmentId: dCS.id,   code: "BSCS", name: "BS Computer Science",         level: "BS",  durationYears: 4, totalCredits: 130 } }),
    prisma.program.upsert({ where: { code: "BSSE" }, update: {}, create: { departmentId: dSE.id,   code: "BSSE", name: "BS Software Engineering",      level: "BS",  durationYears: 4, totalCredits: 130 } }),
    prisma.program.upsert({ where: { code: "BSIT" }, update: {}, create: { departmentId: dIT.id,   code: "BSIT", name: "BS Information Technology",    level: "BS",  durationYears: 4, totalCredits: 130 } }),
    prisma.program.upsert({ where: { code: "MSSE" }, update: {}, create: { departmentId: dSE.id,   code: "MSSE", name: "MS Software Engineering",      level: "MS",  durationYears: 2, totalCredits:  66 } }),
  ]);
  console.log("✓ 4 programs");

  // ─── Buildings & Rooms ────────────────────────────────────────────────────
  const [bCS, bNAB] = await Promise.all([
    prisma.building.upsert({ where: { code: "CS-BLOCK" },  update: {}, create: { code: "CS-BLOCK",  name: "Computer Science Block",     abbreviation: "CS"  } }),
    prisma.building.upsert({ where: { code: "NAB" },       update: {}, create: { code: "NAB",       name: "New Academic Block",         abbreviation: "NAB" } }),
  ]);

  const roomDefs = [
    { buildingId: bCS.id,  code: "CS-101", name: "CS Room 101",      capacity: 60,  roomType: "LECTURE_HALL" as const,  hasProjector: true,  hasAC: true  },
    { buildingId: bCS.id,  code: "CS-102", name: "CS Room 102",      capacity: 60,  roomType: "LECTURE_HALL" as const,  hasProjector: true,  hasAC: true  },
    { buildingId: bCS.id,  code: "CS-201", name: "CS Room 201",      capacity: 50,  roomType: "LECTURE_HALL" as const,  hasProjector: true,  hasAC: false },
    { buildingId: bCS.id,  code: "CS-202", name: "CS Room 202",      capacity: 50,  roomType: "LECTURE_HALL" as const,  hasProjector: true,  hasAC: false },
    { buildingId: bCS.id,  code: "LAB-A",  name: "Computer Lab A",   capacity: 40,  roomType: "LAB_COMPUTER" as const,  hasProjector: true,  hasAC: true  },
    { buildingId: bCS.id,  code: "LAB-B",  name: "Computer Lab B",   capacity: 40,  roomType: "LAB_COMPUTER" as const,  hasProjector: true,  hasAC: true  },
    { buildingId: bNAB.id, code: "NAB-101",name: "NAB Lecture Hall 1",capacity: 80,  roomType: "LECTURE_HALL" as const,  hasProjector: true,  hasAC: true  },
    { buildingId: bNAB.id, code: "NAB-102",name: "NAB Lecture Hall 2",capacity: 80,  roomType: "LECTURE_HALL" as const,  hasProjector: true,  hasAC: true  },
    { buildingId: bCS.id,  code: "SEM-1",  name: "Seminar Room 1",   capacity: 25,  roomType: "SEMINAR_ROOM" as const,  hasProjector: true,  hasAC: true  },
  ];
  const rooms: Record<string, { id: string }> = {};
  for (const r of roomDefs) {
    const room = await prisma.room.upsert({ where: { code: r.code }, update: {}, create: r });
    rooms[r.code] = room;
  }
  console.log("✓ 2 buildings, 9 rooms");

  // ─── Academic Semesters ───────────────────────────────────────────────────
  const semF24 = await prisma.academicSemester.upsert({
    where: { code: "F2024" }, update: { isCurrent: true },
    create: { code: "F2024", name: "Fall 2024", semesterType: "FALL", year: 2024, startDate: new Date("2024-09-02"), endDate: new Date("2025-01-25"), isActive: true, isCurrent: true },
  });
  const semS25 = await prisma.academicSemester.upsert({
    where: { code: "S2025" }, update: {},
    create: { code: "S2025", name: "Spring 2025", semesterType: "SPRING", year: 2025, startDate: new Date("2025-02-03"), endDate: new Date("2025-06-20"), isActive: true, isCurrent: false },
  });
  console.log("✓ 2 semesters (Fall 2024 = current)");

  // ─── Batches ──────────────────────────────────────────────────────────────
  const [batF22, batS23, batF23, batF24] = await Promise.all([
    prisma.batch.upsert({ where: { prefix: "F22" }, update: {}, create: { prefix: "F22", label: "Fall 2022",   year: 2022, semesterType: "FALL",   programId: pBSCS.id, isActive: true } }),
    prisma.batch.upsert({ where: { prefix: "S23" }, update: {}, create: { prefix: "S23", label: "Spring 2023", year: 2023, semesterType: "SPRING", programId: pBSCS.id, isActive: true } }),
    prisma.batch.upsert({ where: { prefix: "F23" }, update: {}, create: { prefix: "F23", label: "Fall 2023",   year: 2023, semesterType: "FALL",   programId: pBSCS.id, isActive: true } }),
    prisma.batch.upsert({ where: { prefix: "F24" }, update: {}, create: { prefix: "F24", label: "Fall 2024",   year: 2024, semesterType: "FALL",   programId: pBSCS.id, isActive: true } }),
  ]);
  console.log("✓ 4 batches");

  // ─── Teachers (User + Teacher profile) ───────────────────────────────────
  const teacherDefs = [
    { email: "dr.ahmad@ucas.edu.pk",    name: "Dr. Ahmad Hassan",    empCode: "EMP-001", designation: "Professor",           type: "PERMANENT" as const, track: "TEACHING" as const, maxCH: 9,  deptId: dCS.id,   senior: true  },
    { email: "dr.sarah@ucas.edu.pk",    name: "Dr. Sarah Khan",      empCode: "EMP-002", designation: "Associate Professor", type: "PERMANENT" as const, track: "TEACHING" as const, maxCH: 9,  deptId: dCS.id,   senior: false },
    { email: "dr.imran@ucas.edu.pk",    name: "Dr. Imran Ali",       empCode: "EMP-003", designation: "Associate Professor", type: "PERMANENT" as const, track: "TEACHING" as const, maxCH: 9,  deptId: dSE.id,   senior: false },
    { email: "mr.fahad@ucas.edu.pk",    name: "Mr. Fahad Malik",     empCode: "EMP-004", designation: "Assistant Professor", type: "PERMANENT" as const, track: "TEACHING" as const, maxCH: 12, deptId: dCS.id,   senior: false },
    { email: "ms.zara@ucas.edu.pk",     name: "Ms. Zara Ahmed",      empCode: "EMP-005", designation: "Lecturer",            type: "PERMANENT" as const, track: "TEACHING" as const, maxCH: 12, deptId: dMATH.id, senior: false },
    { email: "dr.tariq@ucas.edu.pk",    name: "Dr. Tariq Mahmood",   empCode: "EMP-006", designation: "Professor",           type: "PERMANENT" as const, track: "RESEARCH" as const, maxCH: 6,  deptId: dCS.id,   senior: true  },
    { email: "ms.hina@ucas.edu.pk",     name: "Ms. Hina Sajid",      empCode: "EMP-007", designation: "Lecturer",            type: "PERMANENT" as const, track: "TEACHING" as const, maxCH: 12, deptId: dIT.id,   senior: false },
    { email: "mr.usman@ucas.edu.pk",    name: "Mr. Usman Raza",      empCode: "EMP-008", designation: "Assistant Professor", type: "CONTRACT" as const,  track: "TEACHING" as const, maxCH: 9,  deptId: dSE.id,   senior: false },
    { email: "dr.nadia@ucas.edu.pk",    name: "Dr. Nadia Chaudhry",  empCode: "EMP-009", designation: "Associate Professor", type: "PERMANENT" as const, track: "TEACHING" as const, maxCH: 9,  deptId: dCS.id,   senior: false },
    { email: "mr.ali@ucas.edu.pk",      name: "Mr. Ali Hassan",      empCode: "EMP-010", designation: "Lecturer",            type: "VISITING" as const,  track: "TEACHING" as const, maxCH: 6,  deptId: dCS.id,   senior: false },
  ];
  const teacherMap: Record<string, string> = {};
  const teacherPwd = await bcrypt.hash("Teacher@123", 10);
  for (const t of teacherDefs) {
    const user = await prisma.user.upsert({
      where: { email: t.email }, update: {},
      create: { email: t.email, name: t.name, passwordHash: teacherPwd, role: "TEACHER" },
    });
    const teacher = await prisma.teacher.upsert({
      where: { userId: user.id }, update: {},
      create: { userId: user.id, departmentId: t.deptId, employeeCode: t.empCode, designation: t.designation, teacherType: t.type, teacherTrack: t.track, maxCreditHours: t.maxCH, hasSeniorityExemption: t.senior },
    });
    teacherMap[t.empCode] = teacher.id;
    // Availability
    const existAvail = await prisma.teacherAvailability.findFirst({ where: { teacherId: teacher.id } });
    if (!existAvail) {
      await prisma.teacherAvailability.create({
        data: { teacherId: teacher.id, daysAvailable: 31, preferredWindow: "FLEXIBLE", freeDayCode: 32 /* Sat */ },
      });
    }
  }
  console.log("✓ 10 teachers");

  // ─── Courses (BSCS full 8-semester roadmap) ───────────────────────────────
  const courseDefs = [
    // Sem 1
    { code: "CS-101",  name: "Programming Fundamentals",   cr: 3, lab: 1, cat: "COMPULSORY" as const, hasLab: true,  deptId: dCS.id   },
    { code: "MATH-101",name: "Calculus I",                 cr: 3, lab: 0, cat: "ALLIED" as const,     hasLab: false, deptId: dMATH.id },
    { code: "CS-103",  name: "Discrete Structures",        cr: 3, lab: 0, cat: "COMPULSORY" as const, hasLab: false, deptId: dCS.id   },
    { code: "PHY-101", name: "Applied Physics",            cr: 3, lab: 1, cat: "ALLIED" as const,     hasLab: true,  deptId: dMATH.id },
    { code: "ENG-101", name: "Functional English",         cr: 3, lab: 0, cat: "ALLIED" as const,     hasLab: false, deptId: dMATH.id },
    // Sem 2
    { code: "CS-201",  name: "Object Oriented Programming",cr: 3, lab: 1, cat: "COMPULSORY" as const, hasLab: true,  deptId: dCS.id   },
    { code: "CS-203",  name: "Data Structures",            cr: 3, lab: 1, cat: "COMPULSORY" as const, hasLab: true,  deptId: dCS.id   },
    { code: "MATH-201",name: "Linear Algebra",             cr: 3, lab: 0, cat: "ALLIED" as const,     hasLab: false, deptId: dMATH.id },
    { code: "MATH-203",name: "Probability & Statistics",   cr: 3, lab: 0, cat: "ALLIED" as const,     hasLab: false, deptId: dMATH.id },
    { code: "ISL-201", name: "Islamic Studies",            cr: 2, lab: 0, cat: "ALLIED" as const,     hasLab: false, deptId: dMATH.id },
    // Sem 3
    { code: "CS-301",  name: "Design & Analysis of Algorithms", cr: 3, lab: 1, cat: "COMPULSORY" as const, hasLab: true,  deptId: dCS.id },
    { code: "CS-303",  name: "Database Systems",           cr: 3, lab: 1, cat: "COMPULSORY" as const, hasLab: true,  deptId: dCS.id   },
    { code: "CS-305",  name: "Computer Organisation & Architecture", cr: 3, lab: 0, cat: "COMPULSORY" as const, hasLab: false, deptId: dCS.id },
    { code: "CS-307",  name: "Operating Systems",          cr: 3, lab: 1, cat: "COMPULSORY" as const, hasLab: true,  deptId: dCS.id   },
    { code: "ENG-301", name: "Communication & Presentation Skills", cr: 3, lab: 0, cat: "ALLIED" as const, hasLab: false, deptId: dMATH.id },
    // Sem 4
    { code: "SE-401",  name: "Software Engineering",       cr: 3, lab: 1, cat: "COMPULSORY" as const, hasLab: true,  deptId: dSE.id   },
    { code: "CS-401",  name: "Computer Networks",          cr: 3, lab: 1, cat: "COMPULSORY" as const, hasLab: true,  deptId: dCS.id   },
    { code: "CS-403",  name: "Theory of Computation",      cr: 3, lab: 0, cat: "COMPULSORY" as const, hasLab: false, deptId: dCS.id   },
    { code: "CS-405",  name: "Web Technologies",           cr: 3, lab: 1, cat: "COMPULSORY" as const, hasLab: true,  deptId: dCS.id   },
    { code: "PAK-401", name: "Pakistan Studies",           cr: 2, lab: 0, cat: "ALLIED" as const,     hasLab: false, deptId: dMATH.id },
    // Sem 5
    { code: "CS-501",  name: "Artificial Intelligence",    cr: 3, lab: 1, cat: "COMPULSORY" as const, hasLab: true,  deptId: dCS.id   },
    { code: "CS-503",  name: "Compiler Construction",      cr: 3, lab: 1, cat: "COMPULSORY" as const, hasLab: true,  deptId: dCS.id   },
    { code: "CS-505",  name: "Numerical Computing",        cr: 3, lab: 1, cat: "COMPULSORY" as const, hasLab: true,  deptId: dCS.id   },
    { code: "CS-507",  name: "Human Computer Interaction", cr: 3, lab: 1, cat: "COMPULSORY" as const, hasLab: true,  deptId: dCS.id   },
    { code: "CS-509",  name: "Data Mining",                cr: 3, lab: 1, cat: "ELECTIVE" as const,   hasLab: true,  deptId: dCS.id   },
    // Sem 6
    { code: "CS-601",  name: "Machine Learning",           cr: 3, lab: 1, cat: "COMPULSORY" as const, hasLab: true,  deptId: dCS.id   },
    { code: "SE-601",  name: "Software Testing & Quality", cr: 3, lab: 1, cat: "COMPULSORY" as const, hasLab: true,  deptId: dSE.id   },
    { code: "CS-603",  name: "Information Security",       cr: 3, lab: 1, cat: "COMPULSORY" as const, hasLab: true,  deptId: dCS.id   },
    { code: "CS-605",  name: "Mobile Application Development", cr: 3, lab: 1, cat: "ELECTIVE" as const, hasLab: true, deptId: dCS.id  },
    // Sem 7
    { code: "CS-701",  name: "Final Year Project I",       cr: 3, lab: 0, cat: "COMPULSORY" as const, hasLab: false, deptId: dCS.id   },
    { code: "CS-703",  name: "Cloud Computing",            cr: 3, lab: 1, cat: "ELECTIVE" as const,   hasLab: true,  deptId: dCS.id   },
    { code: "CS-705",  name: "Deep Learning",              cr: 3, lab: 1, cat: "ELECTIVE" as const,   hasLab: true,  deptId: dCS.id   },
    // Sem 8
    { code: "CS-801",  name: "Final Year Project II",      cr: 6, lab: 0, cat: "COMPULSORY" as const, hasLab: false, deptId: dCS.id   },
    { code: "CS-803",  name: "Distributed Systems",        cr: 3, lab: 1, cat: "ELECTIVE" as const,   hasLab: true,  deptId: dCS.id   },
  ];
  const courseMap: Record<string, string> = {};
  for (const c of courseDefs) {
    const course = await prisma.course.upsert({
      where: { code: c.code }, update: {},
      create: { departmentId: c.deptId, code: c.code, name: c.name, creditHours: c.cr, labCreditHours: c.lab, category: c.cat, hasLab: c.hasLab },
    });
    courseMap[c.code] = course.id;
  }
  console.log(`✓ ${courseDefs.length} courses`);

  // ─── BSCS Roadmap for F24 batch ──────────────────────────────────────────
  let roadmap = await prisma.roadmap.upsert({
    where: { programId_batchId: { programId: pBSCS.id, batchId: batF24.id } }, update: {},
    create: { programId: pBSCS.id, batchId: batF24.id, name: "BSCS F2024 Roadmap" },
  });

  const roadmapEntries: { code: string; semNum: number }[] = [
    { code: "CS-101",   semNum: 1 }, { code: "MATH-101", semNum: 1 }, { code: "CS-103",   semNum: 1 },
    { code: "PHY-101",  semNum: 1 }, { code: "ENG-101",  semNum: 1 },
    { code: "CS-201",   semNum: 2 }, { code: "CS-203",   semNum: 2 }, { code: "MATH-201", semNum: 2 },
    { code: "MATH-203", semNum: 2 }, { code: "ISL-201",  semNum: 2 },
    { code: "CS-301",   semNum: 3 }, { code: "CS-303",   semNum: 3 }, { code: "CS-305",   semNum: 3 },
    { code: "CS-307",   semNum: 3 }, { code: "ENG-301",  semNum: 3 },
    { code: "SE-401",   semNum: 4 }, { code: "CS-401",   semNum: 4 }, { code: "CS-403",   semNum: 4 },
    { code: "CS-405",   semNum: 4 }, { code: "PAK-401",  semNum: 4 },
    { code: "CS-501",   semNum: 5 }, { code: "CS-503",   semNum: 5 }, { code: "CS-505",   semNum: 5 },
    { code: "CS-507",   semNum: 5 }, { code: "CS-509",   semNum: 5 },
    { code: "CS-601",   semNum: 6 }, { code: "SE-601",   semNum: 6 }, { code: "CS-603",   semNum: 6 },
    { code: "CS-605",   semNum: 6 },
    { code: "CS-701",   semNum: 7 }, { code: "CS-703",   semNum: 7 }, { code: "CS-705",   semNum: 7 },
    { code: "CS-801",   semNum: 8 }, { code: "CS-803",   semNum: 8 },
  ];
  for (const e of roadmapEntries) {
    await prisma.roadmapEntry.upsert({
      where: { roadmapId_courseId: { roadmapId: roadmap.id, courseId: courseMap[e.code] } }, update: {},
      create: { roadmapId: roadmap.id, courseId: courseMap[e.code], semesterNumber: e.semNum },
    });
  }
  console.log("✓ BSCS roadmap (34 entries)");

  // ─── Sample Students ──────────────────────────────────────────────────────
  const studentPwd = await bcrypt.hash("Student@123", 10);
  const studentDefs = [
    // F22 batch — sem 5 (Fall 2024)
    { email: "2022-cs-001@ucas.edu.pk", name: "Ali Raza",        reg: "2022-CS-001", batchId: batF22.id, prefix: "F22", sem: 5, cgpa: 3.45 },
    { email: "2022-cs-002@ucas.edu.pk", name: "Fatima Malik",    reg: "2022-CS-002", batchId: batF22.id, prefix: "F22", sem: 5, cgpa: 3.80 },
    { email: "2022-cs-003@ucas.edu.pk", name: "Omar Sheikh",     reg: "2022-CS-003", batchId: batF22.id, prefix: "F22", sem: 5, cgpa: 2.65 },
    // F23 batch — sem 3 (Fall 2024)
    { email: "2023-cs-001@ucas.edu.pk", name: "Sara Ahmed",      reg: "2023-CS-001", batchId: batF23.id, prefix: "F23", sem: 3, cgpa: 3.20 },
    { email: "2023-cs-002@ucas.edu.pk", name: "Bilal Khan",      reg: "2023-CS-002", batchId: batF23.id, prefix: "F23", sem: 3, cgpa: 2.90 },
    { email: "2023-cs-003@ucas.edu.pk", name: "Aisha Siddiqui",  reg: "2023-CS-003", batchId: batF23.id, prefix: "F23", sem: 3, cgpa: 3.70 },
    // F24 batch — sem 1 (Fall 2024)
    { email: "2024-cs-001@ucas.edu.pk", name: "Hassan Ali",      reg: "2024-CS-001", batchId: batF24.id, prefix: "F24", sem: 1, cgpa: 0.0  },
    { email: "2024-cs-002@ucas.edu.pk", name: "Zainab Hussain",  reg: "2024-CS-002", batchId: batF24.id, prefix: "F24", sem: 1, cgpa: 0.0  },
    { email: "2024-cs-003@ucas.edu.pk", name: "Umar Farooq",     reg: "2024-CS-003", batchId: batF24.id, prefix: "F24", sem: 1, cgpa: 0.0  },
    { email: "2024-cs-004@ucas.edu.pk", name: "Noor Fatima",     reg: "2024-CS-004", batchId: batF24.id, prefix: "F24", sem: 1, cgpa: 0.0  },
  ];
  for (const s of studentDefs) {
    const user = await prisma.user.upsert({
      where: { email: s.email }, update: {},
      create: { email: s.email, name: s.name, passwordHash: studentPwd, role: "STUDENT" },
    });
    await prisma.student.upsert({
      where: { userId: user.id }, update: {},
      create: { userId: user.id, programId: pBSCS.id, batchId: s.batchId, registrationNo: s.reg, batchPrefix: s.prefix, semesterNumber: s.sem, cgpa: s.cgpa },
    });
  }
  console.log("✓ 10 students (3 batches)");

  // ─── Sections for Fall 2024 ───────────────────────────────────────────────
  // F24 batch: sem 1 courses (odd semesters run in Fall)
  // F23 batch: sem 3 courses
  // F22 batch: sem 5 courses

  const sectionDefs: { courseCode: string; semNum: number; sections: string[]; cap: number }[] = [
    // Semester 1 (F24 batch)
    { courseCode: "CS-101",   semNum: 1, sections: ["A","B"], cap: 50 },
    { courseCode: "MATH-101", semNum: 1, sections: ["A","B"], cap: 50 },
    { courseCode: "CS-103",   semNum: 1, sections: ["A","B"], cap: 50 },
    { courseCode: "PHY-101",  semNum: 1, sections: ["A"],     cap: 50 },
    { courseCode: "ENG-101",  semNum: 1, sections: ["A"],     cap: 50 },
    // Semester 3 (F23 batch)
    { courseCode: "CS-301",   semNum: 3, sections: ["A","B"], cap: 45 },
    { courseCode: "CS-303",   semNum: 3, sections: ["A","B"], cap: 45 },
    { courseCode: "CS-305",   semNum: 3, sections: ["A"],     cap: 45 },
    { courseCode: "CS-307",   semNum: 3, sections: ["A","B"], cap: 45 },
    { courseCode: "ENG-301",  semNum: 3, sections: ["A"],     cap: 45 },
    // Semester 5 (F22 batch)
    { courseCode: "CS-501",   semNum: 5, sections: ["A","B"], cap: 40 },
    { courseCode: "CS-503",   semNum: 5, sections: ["A"],     cap: 40 },
    { courseCode: "CS-505",   semNum: 5, sections: ["A"],     cap: 40 },
    { courseCode: "CS-507",   semNum: 5, sections: ["A"],     cap: 40 },
    { courseCode: "CS-509",   semNum: 5, sections: ["A"],     cap: 40 },
  ];

  const sectionMap: Record<string, string> = {}; // "courseCode-sectionCode" -> id
  for (const def of sectionDefs) {
    for (const secCode of def.sections) {
      const key = `${def.courseCode}-${secCode}-${def.semNum}`;
      try {
        const sec = await prisma.section.upsert({
          where: { courseId_programId_semesterId_sectionCode: {
            courseId: courseMap[def.courseCode], programId: pBSCS.id,
            semesterId: semF24.id, sectionCode: secCode,
          }},
          update: {},
          create: { courseId: courseMap[def.courseCode], programId: pBSCS.id, semesterId: semF24.id, sectionCode: secCode, capacity: def.cap, semesterNumber: def.semNum },
        });
        sectionMap[key] = sec.id;
      } catch (e) { /* ignore */ }
    }
  }
  console.log(`✓ ${Object.keys(sectionMap).length} sections`);

  // ─── Time Patterns for Fall 2024 ─────────────────────────────────────────
  const tpDefs = [
    { name: "MWF 08:00",  days: MWF, s: slot(8,0),  spm: 11, mpw: 55  },
    { name: "MWF 09:00",  days: MWF, s: slot(9,0),  spm: 11, mpw: 55  },
    { name: "MWF 10:00",  days: MWF, s: slot(10,0), spm: 11, mpw: 55  },
    { name: "MWF 11:00",  days: MWF, s: slot(11,0), spm: 11, mpw: 55  },
    { name: "MWF 14:00",  days: MWF, s: slot(14,0), spm: 11, mpw: 55  },
    { name: "MWF 15:00",  days: MWF, s: slot(15,0), spm: 11, mpw: 55  },
    { name: "MWF 16:00",  days: MWF, s: slot(16,0), spm: 11, mpw: 55  },
    { name: "TT 08:00",   days: TT,  s: slot(8,0),  spm: 22, mpw: 110 },
    { name: "TT 10:00",   days: TT,  s: slot(10,0), spm: 22, mpw: 110 },
    { name: "TT 12:00",   days: TT,  s: slot(12,0), spm: 22, mpw: 110 },
    { name: "TT 14:00",   days: TT,  s: slot(14,0), spm: 22, mpw: 110 },
    { name: "TT 16:00",   days: TT,  s: slot(16,0), spm: 22, mpw: 110 },
    { name: "MW 08:00",   days: MW,  s: slot(8,0),  spm: 22, mpw: 110 },
    { name: "MW 10:00",   days: MW,  s: slot(10,0), spm: 22, mpw: 110 },
    { name: "MW 14:00",   days: MW,  s: slot(14,0), spm: 22, mpw: 110 },
    // Lab patterns (afternoon)
    { name: "Lab TT 16:00", days: TT, s: slot(16,0), spm: 36, mpw: 180 },
    { name: "Lab MW 16:00", days: MW, s: slot(16,0), spm: 36, mpw: 180 },
  ];
  const tpMap: Record<string, string> = {};
  for (const tp of tpDefs) {
    const existing = await prisma.timePattern.findFirst({ where: { semesterId: semF24.id, name: tp.name } });
    if (existing) { tpMap[tp.name] = existing.id; continue; }
    const created = await prisma.timePattern.create({
      data: { semesterId: semF24.id, name: tp.name, daysCode: tp.days, slot: tp.s, slotsPerMtg: tp.spm, minPerMtg: tp.mpw },
    });
    tpMap[tp.name] = created.id;
  }
  console.log(`✓ ${tpDefs.length} time patterns`);

  // ─── Schedule Solution (PUBLISHED) ────────────────────────────────────────
  const existSol = await prisma.scheduleSolution.findFirst({ where: { semesterId: semF24.id, status: "PUBLISHED" } });
  const solution = existSol ?? await prisma.scheduleSolution.create({
    data: { semesterId: semF24.id, name: "Fall 2024 — Permutation 1", status: "PUBLISHED", permutationIndex: 1, fitnessScore: 87.5, generatedAt: new Date(), publishedAt: new Date() },
  });
  console.log(`✓ Published schedule solution (${solution.id.substring(0,8)}...)`);

  // Helper to create assignment if not exists
  async function assign(secKey: string, teacherCode: string, roomCode: string, tpName: string) {
    const sectionId   = sectionMap[secKey];
    const instructorId = teacherMap[teacherCode];
    const roomId       = rooms[roomCode]?.id;
    const tpId         = tpMap[tpName];
    if (!sectionId || !instructorId || !roomId || !tpId) {
      console.warn(`  ⚠ skip assign ${secKey}: sec=${!!sectionId} t=${!!instructorId} r=${!!roomId} tp=${!!tpId}`);
      return;
    }
    const tp = tpDefs.find(t => t.name === tpName)!;
    const exists = await prisma.assignment.findFirst({ where: { solutionId: solution.id, sectionId } });
    if (exists) return;
    await prisma.assignment.create({
      data: { solutionId: solution.id, sectionId, instructorId, roomId, timePatternId: tpId, slot: tp.s, daysCode: tp.days },
    });
  }

  // Semester 1 assignments (F24)
  await assign("CS-101-A-1",   "EMP-010", "CS-101",  "MWF 08:00");
  await assign("CS-101-B-1",   "EMP-004", "CS-102",  "MWF 09:00");
  await assign("MATH-101-A-1", "EMP-005", "NAB-101", "MWF 09:00");
  await assign("MATH-101-B-1", "EMP-005", "NAB-102", "MWF 10:00");
  await assign("CS-103-A-1",   "EMP-009", "CS-201",  "TT 08:00");
  await assign("CS-103-B-1",   "EMP-004", "CS-202",  "TT 10:00");
  await assign("PHY-101-A-1",  "EMP-005", "NAB-101", "TT 08:00");
  await assign("ENG-101-A-1",  "EMP-007", "NAB-102", "MWF 08:00");

  // Semester 3 assignments (F23)
  await assign("CS-301-A-3",   "EMP-001", "CS-101",  "MWF 10:00");
  await assign("CS-301-B-3",   "EMP-009", "CS-102",  "MWF 11:00");
  await assign("CS-303-A-3",   "EMP-002", "CS-201",  "TT 10:00");
  await assign("CS-303-B-3",   "EMP-004", "CS-202",  "TT 12:00");
  await assign("CS-305-A-3",   "EMP-001", "NAB-101", "MWF 11:00");
  await assign("CS-307-A-3",   "EMP-007", "CS-201",  "MWF 14:00");
  await assign("CS-307-B-3",   "EMP-007", "CS-202",  "MWF 15:00");
  await assign("ENG-301-A-3",  "EMP-007", "SEM-1",   "MW 10:00");

  // Semester 5 assignments (F22)
  await assign("CS-501-A-5",   "EMP-006", "CS-101",  "MWF 14:00");
  await assign("CS-501-B-5",   "EMP-001", "CS-102",  "MWF 15:00");
  await assign("CS-503-A-5",   "EMP-009", "CS-201",  "TT 14:00");
  await assign("CS-505-A-5",   "EMP-002", "NAB-101", "TT 10:00");
  await assign("CS-507-A-5",   "EMP-003", "NAB-102", "MWF 14:00");
  await assign("CS-509-A-5",   "EMP-002", "CS-202",  "TT 16:00");

  console.log("✓ Schedule assignments created");
  console.log("\n✅ Database seeded successfully!");
  console.log("   Admin:   admin@ucas.edu.pk  /  Admin@123");
  console.log("   Teacher: dr.ahmad@ucas.edu.pk  /  Teacher@123");
  console.log("   Student: 2024-cs-001@ucas.edu.pk  /  Student@123");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
