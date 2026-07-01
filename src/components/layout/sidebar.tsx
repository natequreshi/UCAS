"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  CalendarDays,
  Users,
  Users2,
  GraduationCap,
  BookOpen,
  Building2,
  Building,
  LayoutGrid,
  TrendingUp,
  AlertTriangle,
  Upload,
  FileText,
  Shield,
  BarChart3,
  LibraryBig,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    group: "Core",
    items: [
      { label: "Dashboard",      href: "/dashboard", icon: BarChart3   },
      { label: "Schedule Maker", href: "/schedule",  icon: Calendar    },
    ],
  },
  {
    group: "Academic Data",
    items: [
      { label: "Departments",        href: "/departments", icon: Building    },
      { label: "Programs",           href: "/programs",    icon: LibraryBig  },
      { label: "Semesters",          href: "/semesters",   icon: CalendarDays},
      { label: "Batches",            href: "/batches",     icon: Users2      },
      { label: "Teachers",           href: "/teachers",    icon: Users       },
      { label: "Students",           href: "/students",    icon: GraduationCap},
      { label: "Courses & Roadmaps", href: "/courses",     icon: BookOpen    },
      { label: "Rooms & Buildings",  href: "/rooms",       icon: Building2   },
    ],
  },
  {
    group: "Student Services",
    items: [
      { label: "Student Timetable",     href: "/timetable", icon: LayoutGrid   },
      { label: "Academic Progress",     href: "/progress",  icon: TrendingUp   },
      { label: "Probation & Deferment", href: "/probation", icon: AlertTriangle},
    ],
  },
  {
    group: "Tools",
    items: [
      { label: "Data Import",    href: "/import",  icon: Upload  },
      { label: "Reports",        href: "/reports", icon: FileText},
      { label: "Administration", href: "/admin",   icon: Shield  },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col min-h-screen bg-sidebar border-r border-sidebar-border transition-[width] duration-200 ease-in-out shrink-0 overflow-hidden",
        collapsed ? "w-14" : "w-64"
      )}
    >
      {/* ── Logo + toggle ── */}
      <div className="flex items-center h-16 px-3 border-b border-sidebar-border shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>

        {!collapsed && (
          <div className="ml-2.5 leading-none flex-1 min-w-0">
            <span className="font-bold text-gray-900 text-sm tracking-tight">UCAS</span>
            <p className="text-[10px] text-gray-400 mt-0.5">University of Punjab</p>
          </div>
        )}

        <button
          onClick={onToggle}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-sidebar-accent transition-colors shrink-0",
            collapsed ? "mx-auto" : "ml-auto"
          )}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        {navItems.map((group) => (
          <div key={group.group} className={cn("mb-3", collapsed ? "px-1.5" : "px-3")}>
            {!collapsed ? (
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {group.group}
              </p>
            ) : (
              <div className="h-px bg-sidebar-border my-1.5 opacity-60" />
            )}

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
                      title={collapsed ? label : undefined}
                      className={cn(
                        "flex items-center rounded-md text-sm transition-colors",
                        collapsed
                          ? "justify-center w-9 h-9 mx-auto"
                          : "gap-3 px-3 py-2",
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
                      {!collapsed && label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Version ── */}
      <div className={cn("border-t border-sidebar-border py-3", collapsed ? "flex justify-center" : "px-5")}>
        {collapsed ? (
          <span className="text-[9px] text-gray-300 font-mono">v0.1</span>
        ) : (
          <p className="text-[10px] text-gray-400">UCAS v0.1.0</p>
        )}
      </div>
    </aside>
  );
}
