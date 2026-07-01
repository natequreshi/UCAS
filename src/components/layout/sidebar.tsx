"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    group: "Core",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
      { label: "Schedule Maker", href: "/schedule", icon: Calendar },
    ],
  },
  {
    group: "Academic Data",
    items: [
      { label: "Teachers", href: "/teachers", icon: Users },
      { label: "Students", href: "/students", icon: GraduationCap },
      { label: "Courses & Roadmaps", href: "/courses", icon: BookOpen },
      { label: "Rooms & Buildings", href: "/rooms", icon: Building2 },
    ],
  },
  {
    group: "Student Services",
    items: [
      { label: "Student Timetable", href: "/timetable", icon: LayoutGrid },
      { label: "Academic Progress", href: "/progress", icon: TrendingUp },
      { label: "Probation & Deferment", href: "/probation", icon: AlertTriangle },
    ],
  },
  {
    group: "Tools",
    items: [
      { label: "Data Import", href: "/import", icon: Upload },
      { label: "Reports", href: "/reports", icon: FileText },
      { label: "Administration", href: "/admin", icon: Shield },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div className="leading-none">
          <span className="font-bold text-gray-900 text-base tracking-tight">
            UCAS
          </span>
          <p className="text-[10px] text-gray-400 mt-0.5">University of Punjab</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {group.group}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon }) => {
                const isActive =
                  href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(href);

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-primary text-white font-medium"
                          : "text-gray-600 hover:bg-sidebar-accent hover:text-gray-900"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-white" : "text-gray-400"
                        )}
                      />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Version footer */}
      <div className="px-5 py-3 border-t border-sidebar-border">
        <p className="text-[10px] text-gray-400">UCAS v0.1.0</p>
      </div>
    </aside>
  );
}
