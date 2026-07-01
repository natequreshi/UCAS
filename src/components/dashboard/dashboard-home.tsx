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
  TrendingUp,
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

// ─── Component ────────────────────────────────────────────────────────────────

export async function DashboardHome() {
  const { depts, programs, rooms, teachers, batches, sectionCount, activeSemester } =
    await getStats();

  const today = new Date();

  return (
    <div className="space-y-5">

      {/* ── Full-width Calendar ── */}
      <CalendarView activeSemester={activeSemester} />

      {/* ── 4 Widget cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Widget 1 — Quick Stats */}
        <Card className="border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Quick Stats</CardTitle>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="px-4 pt-3 pb-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Departments", value: depts,    icon: Building,   color: "text-blue-600",   bg: "bg-blue-50",   href: "/departments" },
                { label: "Programs",    value: programs,  icon: BookOpen,   color: "text-violet-600", bg: "bg-violet-50", href: "/programs"    },
                { label: "Teachers",    value: teachers,  icon: Users,      color: "text-teal-600",   bg: "bg-teal-50",   href: "/teachers"    },
                { label: "Batches",     value: batches,   icon: Users2,     color: "text-indigo-600", bg: "bg-indigo-50", href: "/batches"     },
                { label: "Rooms",       value: rooms,     icon: Building2,  color: "text-emerald-600",bg: "bg-emerald-50",href: "/rooms"       },
                { label: "Sections",    value: sectionCount, icon: BookMarked, color: "text-primary", bg: "bg-primary/10",href: "/schedule"   },
              ].map(({ label, value, icon: Icon, color, bg, href }) => (
                <Link key={label} href={href} className="group">
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", bg)}>
                      <Icon className={cn("w-3.5 h-3.5", color)} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-gray-900 leading-none tabular-nums">{value}</p>
                      <p className="text-[10px] text-muted-foreground truncate group-hover:text-primary transition-colors">{label}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Widget 2 — Today's Classes */}
        <Card className="border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Today's Classes</CardTitle>
              </div>
              <Badge variant="secondary" className="text-[10px] h-5">
                {format(today, "EEE d MMM")}
              </Badge>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="px-4 py-0">
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <p className="text-xs font-medium text-gray-500 mt-1">No classes today</p>
              <p className="text-[11px] text-muted-foreground max-w-[160px] leading-relaxed">
                Classes appear here once a timetable is generated.
              </p>
              <Link
                href="/schedule"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1"
              >
                Generate schedule <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Widget 3 — Upcoming Events */}
        <Card className="border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Upcoming Events</CardTitle>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="px-4 py-3">
            {activeSemester ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border">
                  <div className="w-0.5 self-stretch rounded-full bg-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{activeSemester.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(activeSemester.startDate), "d MMM")}
                      {" – "}
                      {format(new Date(activeSemester.endDate), "d MMM yyyy")}
                    </p>
                    <Badge className="mt-1.5 text-[9px] h-3.5 px-1.5 bg-primary/10 text-primary border-0 hover:bg-primary/10">
                      Active
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <p className="text-[10px] text-muted-foreground">No additional events</p>
                  <Link href="/semesters" className="text-[10px] text-primary hover:underline mt-1">
                    Manage semesters →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-muted-foreground/50" />
                </div>
                <p className="text-xs font-medium text-gray-500 mt-1">No active semester</p>
                <p className="text-[11px] text-muted-foreground max-w-[160px] leading-relaxed">
                  Add a semester to track academic dates and events.
                </p>
                <Link
                  href="/semesters"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1"
                >
                  Add semester <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Widget 4 — Semester Overview */}
        <Card className="border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Semester Overview</CardTitle>
              </div>
              {activeSemester ? (
                <Badge variant="secondary" className="text-[10px] h-5">
                  {activeSemester.semesterType} {activeSemester.year}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] h-5 text-muted-foreground">
                  None
                </Badge>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="px-4 pt-3 pb-4 space-y-0.5">
            {[
              { label: "Active Batches",    value: batches,      icon: Users2,       href: "/batches"  },
              { label: "Teachers",          value: teachers,     icon: Users,        href: "/teachers" },
              { label: "Sections",          value: sectionCount, icon: BookMarked,   href: "/schedule" },
              { label: "Rooms Available",   value: rooms,        icon: Building2,    href: "/rooms"    },
              { label: "Programs Offered",  value: programs,     icon: GraduationCap,href: "/programs" },
              { label: "Departments",       value: depts,        icon: Building,     href: "/departments"},
            ].map(({ label, value, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                className="group flex items-center justify-between py-1.5 px-1.5 -mx-1.5 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
                    {label}
                  </span>
                </div>
                <span className={cn(
                  "text-xs font-bold tabular-nums",
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
  );
}
