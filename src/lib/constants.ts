// ─── Day bitmasks (same as UniTime convention) ────────────────────────────
export const DAYS = {
  MON: 1,
  TUE: 2,
  WED: 4,
  THU: 8,
  FRI: 16,
  SAT: 32,
  SUN: 64,
} as const;

// ─── Common time patterns (slot = minutes_from_midnight / 5) ─────────────
// 8:00 AM = 480 min / 5 = 96
// 55 min  = 11 slots
// 110 min = 22 slots
export const TIME_SLOTS = {
  "08:00": 96,
  "08:55": 107,
  "09:00": 108,
  "09:55": 119,
  "10:00": 120,
  "10:55": 131,
  "11:00": 132,
  "11:55": 143,
  "12:00": 144,
  "12:30": 150,
  "13:00": 156,
  "14:00": 168,
  "14:55": 179,
  "15:00": 180,
  "15:55": 191,
  "16:00": 192,
  "16:55": 203,
  "17:00": 204,
  "17:55": 215,
  "18:00": 216,
  "18:55": 227,
  "19:00": 228,
  "20:00": 240,
  "21:00": 252,
} as const;

// ─── Preference levels (UniTime-compatible) ──────────────────────────────
export const PREF_LEVELS = {
  REQUIRED: -2,
  STRONGLY_PREFERRED: -1,
  PREFERRED: 0,
  DISCOURAGED: 1,
  PROHIBITED: 2,
} as const;

export const PREF_LABELS: Record<number, string> = {
  "-2": "Required",
  "-1": "Strongly Preferred",
  "0": "Preferred",
  "1": "Discouraged",
  "2": "Prohibited",
};

// ─── Role display labels ──────────────────────────────────────────────────
export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SCHEDULE_MANAGER: "Schedule Manager",
  DEPARTMENT_CHAIR: "Department Chair",
  TEACHER: "Teacher",
  STUDENT: "Student",
  VIEWER: "Viewer",
};

// ─── Teacher type labels ──────────────────────────────────────────────────
export const TEACHER_TYPE_LABELS: Record<string, string> = {
  PERMANENT: "Permanent",
  CONTRACT: "Contract",
  ADJUNCT: "Adjunct",
  VISITING: "Visiting",
};

// ─── Program level labels ─────────────────────────────────────────────────
export const PROGRAM_LEVEL_LABELS: Record<string, string> = {
  BS: "Bachelor's (BS)",
  MS: "Master's (MS)",
  PHD: "Doctorate (PhD)",
};

// ─── Semester color coding for timetable blocks ──────────────────────────
export const SEMESTER_COLORS: Record<number, string> = {
  1: "bg-blue-100 text-blue-800 border-blue-200",
  2: "bg-blue-100 text-blue-800 border-blue-200",
  3: "bg-violet-100 text-violet-800 border-violet-200",
  4: "bg-violet-100 text-violet-800 border-violet-200",
  5: "bg-emerald-100 text-emerald-800 border-emerald-200",
  6: "bg-emerald-100 text-emerald-800 border-emerald-200",
  7: "bg-amber-100 text-amber-800 border-amber-200",
  8: "bg-amber-100 text-amber-800 border-amber-200",
};

// ─── Navigation modules (dashboard cards) ────────────────────────────────
export const MODULES = [
  {
    id: "schedule",
    label: "Schedule Maker",
    description: "Generate and manage course timetables",
    href: "/schedule",
    icon: "Calendar",
    color: "bg-indigo-500",
  },
  {
    id: "teachers",
    label: "Teachers",
    description: "Manage faculty preferences and availability",
    href: "/teachers",
    icon: "Users",
    color: "bg-blue-500",
  },
  {
    id: "students",
    label: "Students",
    description: "Student records and enrollment",
    href: "/students",
    icon: "GraduationCap",
    color: "bg-cyan-500",
  },
  {
    id: "courses",
    label: "Courses & Roadmaps",
    description: "Course catalog, outlines, and roadmaps",
    href: "/courses",
    icon: "BookOpen",
    color: "bg-teal-500",
  },
  {
    id: "rooms",
    label: "Rooms & Buildings",
    description: "Rooms, labs, and building management",
    href: "/rooms",
    icon: "Building2",
    color: "bg-green-500",
  },
  {
    id: "timetable",
    label: "Student Timetable",
    description: "Personal timetable generation",
    href: "/timetable",
    icon: "LayoutGrid",
    color: "bg-lime-500",
  },
  {
    id: "progress",
    label: "Academic Progress",
    description: "CGPA, credit hours, roadmap alignment",
    href: "/progress",
    icon: "TrendingUp",
    color: "bg-yellow-500",
  },
  {
    id: "probation",
    label: "Probation & Deferment",
    description: "Probation tracking and deferment programs",
    href: "/probation",
    icon: "AlertTriangle",
    color: "bg-orange-500",
  },
  {
    id: "import",
    label: "Data Import",
    description: "Excel bulk import for all entity types",
    href: "/import",
    icon: "Upload",
    color: "bg-pink-500",
  },
  {
    id: "reports",
    label: "Reports",
    description: "PDF reports: allocation, load, utilization",
    href: "/reports",
    icon: "FileText",
    color: "bg-rose-500",
  },
  {
    id: "admin",
    label: "Administration",
    description: "Users, roles, access restrictions, settings",
    href: "/admin",
    icon: "Shield",
    color: "bg-purple-500",
  },
] as const;
