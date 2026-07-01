import Link from "next/link";
import {
  Building,
  BookOpen,
  Users,
  Building2,
  Users2,
  CalendarCheck,
  Clock,
  BookMarked,
  Layers,
  AlertCircle,
  ArrowRight,
  CalendarDays,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { CalendarView } from "./calendar-view";
import { format } from "date-fns";

// ─── DB fetch ─────────────────────────────────────────────────────────────────

async function getStats() {
  try {
    const [depts, programs, rooms, teachers, batches, activeSemester, sectionCount] =
      await Promise.all([
        prisma.department.count(),
        prisma.program.count(),
        prisma.room.count(),
        prisma.teacher.count(),
        prisma.batch.count(),
        prisma.academicSemester.findFirst({
          where: { isCurrent: true },
          select: {
            name: true,
            startDate: true,
            endDate: true,
            semesterType: true,
            year: true,
          },
        }),
        prisma.section.count().catch(() => 0),
      ]);

    return {
      depts, programs, rooms, teachers, batches, sectionCount,
      activeSemester: activeSemester
        ? {
            name: activeSemester.name,
            startDate: activeSemester.startDate.toISOString(),
            endDate: activeSemester.endDate.toISOString(),
            semesterType: activeSemester.semesterType,
            year: activeSemester.year,
          }
        : null,
    };
  } catch {
    return {
      depts: 0, programs: 0, rooms: 0, teachers: 0, batches: 0,
      sectionCount: 0, activeSemester: null,
    };
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATS = [
  { key: "depts" as const,    label: "Departments", icon: Building,   color: "text-blue-600",    bg: "bg-blue-50",    href: "/departments" },
  { key: "programs" as const, label: "Programs",    icon: BookOpen,   color: "text-violet-600",  bg: "bg-violet-50",  href: "/programs"    },
  { key: "teachers" as const, label: "Teachers",    icon: Users,      color: "text-teal-600",    bg: "bg-teal-50",    href: "/teachers"    },
  { key: "batches" as const,  label: "Batches",     icon: Users2,     color: "text-indigo-600",  bg: "bg-indigo-50",  href: "/batches"     },
  { key: "rooms" as const,    label: "Rooms",       icon: Building2,  color: "text-emerald-600", bg: "bg-emerald-50", href: "/rooms"       },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export async function DashboardHome() {
  const { depts, programs, rooms, teachers, batches, sectionCount, activeSemester } =
    await getStats();

  const statsValues = { depts, programs, rooms, teachers, batches };
  const today = new Date();

  return (
    <div className="max-w-7xl">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5 items-start">

        {/* ── LEFT: Calendar (main) ── */}
        <CalendarView activeSemester={activeSemester} />

        {/* ── RIGHT: Sidebar ── */}
        <div className="space-y-4">

          {/* Compact stat cards — 2-col grid */}
          <div className="grid grid-cols-2 gap-2">
            {STATS.map(({ key, label, icon: Icon, color, bg, href }) => (
              <Link key={key} href={href} className="group block">
                <Card className="border-border hover:border-primary/40 hover:shadow-sm transition-all">
                  <CardContent className="p-3">
                    <div className={cn("inline-flex items-center justify-center w-7 h-7 rounded-md mb-2", bg)}>
                      <Icon className={cn("w-3.5 h-3.5", color)} />
                    </div>
                    <p className="text-xl font-bold text-gray-900 leading-none tabular-nums">
                      {statsValues[key]}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate group-hover:text-primary transition-colors">
                      {label}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {/* Sections — spans full width as 5th item would leave a gap */}
            <Link href="/schedule" className="group block col-span-2">
              <Card className="border-border hover:border-primary/40 hover:shadow-sm transition-all">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 shrink-0">
                    <BookMarked className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-gray-900 leading-none tabular-nums">
                      {sectionCount}
                    </p>
                    <p className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
                      Sections this semester
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Today's Schedule */}
          <Card className="border-border">
            <CardHeader className="pb-2 pt-3.5 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-3.5 h-3.5 text-primary" />
                  <CardTitle className="text-xs font-semibold">Today's Classes</CardTitle>
                </div>
                <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                  {format(today, "EEE, d MMM")}
                </Badge>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="px-4 py-0">
              <div className="flex flex-col items-center justify-center py-6 text-center gap-1.5">
                <CalendarDays className="w-6 h-6 text-muted-foreground/40 mb-1" />
                <p className="text-xs font-medium text-gray-500">No classes today</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Populate after generating a schedule.
                </p>
                <Link
                  href="/schedule"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1"
                >
                  Generate schedule <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-border">
            <CardHeader className="pb-2 pt-3.5 px-4">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <CardTitle className="text-xs font-semibold">Upcoming Events</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="px-4 py-3 space-y-2">
              {activeSemester ? (
                <>
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40 border border-border">
                    <div className="w-0.5 self-stretch rounded-full bg-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-gray-800 leading-tight">
                        {activeSemester.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {format(new Date(activeSemester.startDate), "d MMM")}
                        {" – "}
                        {format(new Date(activeSemester.endDate), "d MMM yyyy")}
                      </p>
                      <Badge className="mt-1.5 text-[9px] h-3.5 px-1.5 bg-primary/10 text-primary hover:bg-primary/10 border-0">
                        Active
                      </Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center py-2">
                    No additional events scheduled
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center gap-1.5">
                  <AlertCircle className="w-6 h-6 text-muted-foreground/40 mb-1" />
                  <p className="text-xs font-medium text-gray-500">No active semester</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Add a semester to track academic events.
                  </p>
                  <Link
                    href="/semesters"
                    className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1"
                  >
                    Add semester <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Semester Overview */}
          <Card className="border-border">
            <CardHeader className="pb-2 pt-3.5 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <CardTitle className="text-xs font-semibold">Semester Overview</CardTitle>
                </div>
                {activeSemester ? (
                  <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                    {activeSemester.semesterType} {activeSemester.year}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-muted-foreground">
                    None
                  </Badge>
                )}
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="px-4 pt-2.5 pb-3 space-y-1">
              {[
                { label: "Active Batches",  value: batches,      icon: Users2,       href: "/batches"  },
                { label: "Teachers",        value: teachers,     icon: Users,        href: "/teachers" },
                { label: "Sections",        value: sectionCount, icon: BookMarked,   href: "/schedule" },
                { label: "Rooms",           value: rooms,        icon: Building2,    href: "/rooms"    },
                { label: "Programs",        value: programs,     icon: GraduationCap,href: "/programs" },
              ].map(({ label, value, icon: Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex items-center justify-between py-1 px-1 -mx-1 rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[11px] text-gray-600 group-hover:text-gray-900 transition-colors">
                      {label}
                    </span>
                  </div>
                  <span className={cn(
                    "text-[11px] font-semibold tabular-nums",
                    value === 0 ? "text-muted-foreground" : "text-gray-900"
                  )}>
                    {value}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
