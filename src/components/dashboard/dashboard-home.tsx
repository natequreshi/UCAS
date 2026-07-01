"use client";

import Link from "next/link";
import {
  Calendar,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  LayoutGrid,
  TrendingUp,
  AlertTriangle,
  Upload,
  FileText,
  Shield,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const modules = [
  {
    id: "schedule",
    label: "Schedule Maker",
    description: "Generate and manage course timetables with drag & drop",
    href: "/schedule",
    icon: Calendar,
    color: "bg-indigo-500",
    bgLight: "bg-indigo-50",
    textColor: "text-indigo-700",
    status: "active",
  },
  {
    id: "teachers",
    label: "Teachers",
    description: "Faculty preferences, availability, track and exemptions",
    href: "/teachers",
    icon: Users,
    color: "bg-blue-500",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    status: "active",
  },
  {
    id: "students",
    label: "Students",
    description: "Student records, batch cohorts and enrollment",
    href: "/students",
    icon: GraduationCap,
    color: "bg-cyan-500",
    bgLight: "bg-cyan-50",
    textColor: "text-cyan-700",
    status: "active",
  },
  {
    id: "courses",
    label: "Courses & Roadmaps",
    description: "Course catalog, outlines, prerequisites and roadmaps",
    href: "/courses",
    icon: BookOpen,
    color: "bg-teal-500",
    bgLight: "bg-teal-50",
    textColor: "text-teal-700",
    status: "active",
  },
  {
    id: "rooms",
    label: "Rooms & Buildings",
    description: "Manage rooms, computer labs and building allocations",
    href: "/rooms",
    icon: Building2,
    color: "bg-green-500",
    bgLight: "bg-green-50",
    textColor: "text-green-700",
    status: "active",
  },
  {
    id: "timetable",
    label: "Student Timetable",
    description: "Generate personal clash-free timetables with permutations",
    href: "/timetable",
    icon: LayoutGrid,
    color: "bg-lime-600",
    bgLight: "bg-lime-50",
    textColor: "text-lime-700",
    status: "active",
  },
  {
    id: "progress",
    label: "Academic Progress",
    description: "CGPA tracking, credit hours and roadmap alignment",
    href: "/progress",
    icon: TrendingUp,
    color: "bg-yellow-500",
    bgLight: "bg-yellow-50",
    textColor: "text-yellow-700",
    status: "active",
  },
  {
    id: "probation",
    label: "Probation & Deferment",
    description: "Monitor academic probation and manage deferment programs",
    href: "/probation",
    icon: AlertTriangle,
    color: "bg-orange-500",
    bgLight: "bg-orange-50",
    textColor: "text-orange-700",
    status: "active",
  },
  {
    id: "import",
    label: "Data Import",
    description: "Excel bulk import for students, teachers, courses and more",
    href: "/import",
    icon: Upload,
    color: "bg-pink-500",
    bgLight: "bg-pink-50",
    textColor: "text-pink-700",
    status: "active",
  },
  {
    id: "reports",
    label: "Reports & PDF",
    description: "Generate and email allocation, load and utilization reports",
    href: "/reports",
    icon: FileText,
    color: "bg-rose-500",
    bgLight: "bg-rose-50",
    textColor: "text-rose-700",
    status: "active",
  },
  {
    id: "admin",
    label: "Administration",
    description: "Users, roles, access restrictions and system settings",
    href: "/admin",
    icon: Shield,
    color: "bg-purple-500",
    bgLight: "bg-purple-50",
    textColor: "text-purple-700",
    status: "active",
  },
];

// Quick stats (placeholder — will be DB-driven in v0.2.0+)
const quickStats = [
  { label: "Active Teachers", value: "—", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Students Enrolled", value: "—", icon: GraduationCap, color: "text-cyan-600", bg: "bg-cyan-50" },
  { label: "Sections This Semester", value: "—", icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "Pending Clashes", value: "—", icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
];

export function DashboardHome() {
  return (
    <div className="space-y-8 max-w-7xl animate-fade-in">
      {/* Quick stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2.5 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 leading-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System status */}
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-emerald-800">System ready</p>
          <p className="text-xs text-emerald-600 mt-0.5">
            UCAS v0.1.0 — database connected, all modules available.
            Start by importing your academic data via the Data Import module.
          </p>
        </div>
        <Badge variant="success" className="shrink-0">v0.1.0</Badge>
      </div>

      {/* Module grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Modules</h2>
          <span className="text-xs text-muted-foreground">{modules.length} modules available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((mod) => (
            <Link
              key={mod.id}
              href={mod.href}
              className="group block"
            >
              <Card className="h-full border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn("p-2.5 rounded-xl", mod.bgLight)}>
                      <mod.icon className={cn("w-5 h-5", mod.textColor)} />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                    {mod.label}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {mod.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Development roadmap */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Development Roadmap
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { version: "v0.1.0", label: "Project Scaffold", status: "done", desc: "Next.js, Auth, DB schema, Login, Dashboard" },
            { version: "v0.2.0", label: "Admin Panel", status: "next", desc: "User management, roles, access restrictions" },
            { version: "v0.3.0", label: "Data Import", status: "upcoming", desc: "Excel templates for 16 entity types" },
            { version: "v0.4.0", label: "Teacher Management", status: "upcoming", desc: "Preferences, availability, exemptions" },
            { version: "v0.5.0", label: "Courses & Roadmaps", status: "upcoming", desc: "Prerequisites, credit hours, outlines" },
            { version: "v0.9.0", label: "CSP Engine", status: "upcoming", desc: "Constraint satisfaction scheduling algorithm" },
            { version: "v0.10.0", label: "Genetic Algorithm", status: "upcoming", desc: "Multiple timetable permutations, fitness scoring" },
            { version: "v1.0.0", label: "Production Release", status: "upcoming", desc: "All modules complete and tested" },
          ].map((item) => (
            <div
              key={item.version}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border text-sm",
                item.status === "done" && "bg-emerald-50 border-emerald-200",
                item.status === "next" && "bg-indigo-50 border-indigo-200",
                item.status === "upcoming" && "bg-gray-50 border-gray-200"
              )}
            >
              <div className="shrink-0 mt-0.5">
                {item.status === "done" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                {item.status === "next" && (
                  <Clock className="w-4 h-4 text-indigo-600" />
                )}
                {item.status === "upcoming" && (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-gray-500">
                    {item.version}
                  </span>
                  <span className="font-medium text-gray-900 text-xs">
                    {item.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
