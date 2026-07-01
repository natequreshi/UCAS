import Link from "next/link";
import {
  Building,
  BookOpen,
  Users,
  Building2,
  Users2,
  Calendar,
  GraduationCap,
  LayoutGrid,
  TrendingUp,
  AlertTriangle,
  Upload,
  FileText,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { CalendarView } from "./calendar-view";

// ─── DB fetch ────────────────────────────────────────────────────────────────

async function getStats() {
  try {
    const [depts, programs, rooms, teachers, batches, activeSemester] =
      await Promise.all([
        prisma.department.count(),
        prisma.program.count(),
        prisma.room.count(),
        prisma.teacher.count(),
        prisma.batch.count(),
        prisma.academicSemester.findFirst({
          where: { isCurrent: true },
          select: { name: true, startDate: true, endDate: true },
        }),
      ]);

    return {
      depts,
      programs,
      rooms,
      teachers,
      batches,
      activeSemester: activeSemester
        ? {
            name: activeSemester.name,
            startDate: activeSemester.startDate.toISOString(),
            endDate: activeSemester.endDate.toISOString(),
          }
        : null,
    };
  } catch {
    return {
      depts: 0,
      programs: 0,
      rooms: 0,
      teachers: 0,
      batches: 0,
      activeSemester: null,
    };
  }
}

// ─── Static config ────────────────────────────────────────────────────────────

const STATS = [
  {
    key: "depts" as const,
    label: "Departments",
    icon: Building,
    color: "text-blue-600",
    bg: "bg-blue-50",
    href: "/departments",
  },
  {
    key: "programs" as const,
    label: "Programs",
    icon: BookOpen,
    color: "text-violet-600",
    bg: "bg-violet-50",
    href: "/programs",
  },
  {
    key: "teachers" as const,
    label: "Teachers",
    icon: Users,
    color: "text-teal-600",
    bg: "bg-teal-50",
    href: "/teachers",
  },
  {
    key: "batches" as const,
    label: "Batches",
    icon: Users2,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    href: "/batches",
  },
  {
    key: "rooms" as const,
    label: "Rooms",
    icon: Building2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    href: "/rooms",
  },
] as const;

const MODULES = [
  {
    label: "Schedule Maker",
    href: "/schedule",
    icon: Calendar,
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    desc: "Generate and manage timetables",
  },
  {
    label: "Teachers",
    href: "/teachers",
    icon: Users,
    bg: "bg-blue-50",
    text: "text-blue-700",
    desc: "Faculty preferences & availability",
  },
  {
    label: "Students",
    href: "/students",
    icon: GraduationCap,
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    desc: "Student records and enrollment",
  },
  {
    label: "Courses & Roadmaps",
    href: "/courses",
    icon: BookOpen,
    bg: "bg-teal-50",
    text: "text-teal-700",
    desc: "Catalog, outlines, prerequisites",
  },
  {
    label: "Student Timetable",
    href: "/timetable",
    icon: LayoutGrid,
    bg: "bg-lime-50",
    text: "text-lime-700",
    desc: "Personal clash-free timetables",
  },
  {
    label: "Academic Progress",
    href: "/progress",
    icon: TrendingUp,
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    desc: "CGPA, credits, roadmap progress",
  },
  {
    label: "Probation & Deferment",
    href: "/probation",
    icon: AlertTriangle,
    bg: "bg-orange-50",
    text: "text-orange-700",
    desc: "Probation and deferment tracking",
  },
  {
    label: "Data Import",
    href: "/import",
    icon: Upload,
    bg: "bg-pink-50",
    text: "text-pink-700",
    desc: "Excel bulk import for all types",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileText,
    bg: "bg-rose-50",
    text: "text-rose-700",
    desc: "Allocation, load & utilization PDFs",
  },
  {
    label: "Administration",
    href: "/admin",
    icon: Shield,
    bg: "bg-purple-50",
    text: "text-purple-700",
    desc: "Users, roles, access settings",
  },
];

// ─── Component ─────────────────────────────────────────────────────────────

export async function DashboardHome() {
  const { depts, programs, rooms, teachers, batches, activeSemester } =
    await getStats();

  const statsValues = { depts, programs, rooms, teachers, batches };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATS.map(({ key, label, icon: Icon, color, bg, href }) => (
          <Link key={key} href={href} className="group block">
            <Card className="border-border hover:border-primary/40 hover:shadow-sm transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
                    bg
                  )}
                >
                  <Icon className={cn("w-4 h-4", color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-gray-900 leading-none tabular-nums">
                    {statsValues[key]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate group-hover:text-primary transition-colors">
                    {label}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* ── Calendar / Timetable ── */}
      <CalendarView activeSemester={activeSemester} />

      {/* ── Module grid ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Modules</h2>
          <span className="text-xs text-muted-foreground">
            {MODULES.length} available
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {MODULES.map((mod) => (
            <Link key={mod.href} href={mod.href} className="group block">
              <Card className="border-border h-full hover:border-primary/40 hover:shadow-sm transition-all">
                <CardContent className="p-4">
                  <div
                    className={cn(
                      "inline-flex items-center justify-center w-8 h-8 rounded-lg mb-2.5",
                      mod.bg
                    )}
                  >
                    <mod.icon className={cn("w-4 h-4", mod.text)} />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 group-hover:text-primary transition-colors leading-tight mb-0.5">
                    {mod.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {mod.desc}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
