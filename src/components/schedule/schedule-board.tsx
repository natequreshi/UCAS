"use client";

import { useState, useCallback, useRef } from "react";
import { assignSection, unassignSection, publishSolution } from "@/app/(dashboard)/schedule/actions";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  GripVertical, X, Lock, CheckCircle2, Eye, EyeOff,
  ChevronLeft, ChevronRight, Send, Printer,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type Course = { id: string; code: string; name: string; creditHours: number; hasLab: boolean; category: string };
type Program = { id: string; code: string; name: string };
type Section = {
  id: string; sectionCode: string; semesterNumber: number; capacity: number;
  course: Course; program: Program;
};
type Room = { id: string; code: string; name: string; capacity: number; roomType: string; building: { code: string; name: string } };
type Teacher = { id: string; employeeCode: string; designation: string; user: { name: string } };
type TimePattern = { id: string; name: string; daysCode: number; slot: number; slotsPerMtg: number; minPerMtg: number };
type Assignment = {
  id: string; slot: number; daysCode: number;
  section: { id: string; sectionCode: string; semesterNumber: number; course: { id: string; code: string; name: string; creditHours: number } };
  instructor?: { id: string; employeeCode: string; user: { name: string } } | null;
  room?: { id: string; code: string; name: string; capacity: number; roomType: string } | null;
  timePattern: TimePattern;
};
type Solution = { id: string; name: string; status: string };

interface Props {
  sections: Section[];
  assignments: Assignment[];
  rooms: Room[];
  teachers: Teacher[];
  timePatterns: TimePattern[];
  solution: Solution;
}

// ── Constants ─────────────────────────────────────────────────────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_BITS = [1, 2, 4, 8, 16, 32];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8..18
const SLOT_HEIGHT = 56; // px per hour

// Semester colour palette (index = semesterNumber - 1)
const SEM_COLORS = [
  "bg-blue-500 border-blue-600 text-white",      // sem 1
  "bg-violet-500 border-violet-600 text-white",  // sem 2
  "bg-teal-500 border-teal-600 text-white",      // sem 3
  "bg-emerald-500 border-emerald-600 text-white",// sem 4
  "bg-amber-500 border-amber-600 text-white",    // sem 5
  "bg-orange-500 border-orange-600 text-white",  // sem 6
  "bg-rose-500 border-rose-600 text-white",      // sem 7
  "bg-pink-500 border-pink-600 text-white",      // sem 8
];
const SEM_DOTS = [
  "bg-blue-500", "bg-violet-500", "bg-teal-500", "bg-emerald-500",
  "bg-amber-500", "bg-orange-500", "bg-rose-500", "bg-pink-500",
];
const SEM_LIGHT = [
  "bg-blue-50 border-blue-200",
  "bg-violet-50 border-violet-200",
  "bg-teal-50 border-teal-200",
  "bg-emerald-50 border-emerald-200",
  "bg-amber-50 border-amber-200",
  "bg-orange-50 border-orange-200",
  "bg-rose-50 border-rose-200",
  "bg-pink-50 border-pink-200",
];

function slotToHHMM(s: number) {
  const mins = s * 5;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function slotToHour(s: number) {
  const mins = s * 5;
  return Math.floor(mins / 60) + (mins % 60) / 60;
}

// ── Main Component ─────────────────────────────────────────────────────────
export function ScheduleBoard({ sections, assignments: initAssignments, rooms, teachers, timePatterns, solution }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>(initAssignments);
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  const [draggedSection, setDraggedSection] = useState<Section | null>(null);
  const [assignDialog, setAssignDialog] = useState<{ section: Section; dayBit: number; startSlot: number } | null>(null);
  const [detailDialog, setDetailDialog] = useState<Assignment | null>(null);
  const [filterSem, setFilterSem] = useState<string>("all");
  const [saving, setSaving] = useState(false);

  // Form state for assign dialog
  const [selTeacher, setSelTeacher] = useState("");
  const [selRoom, setSelRoom] = useState("");
  const [selPattern, setSelPattern] = useState("");

  const assignedIds = new Set(assignments.map(a => a.section.id));

  // ── Sidebar sections ───────────────────────────────────────────────────
  const filteredSections = filterSem === "all"
    ? sections
    : sections.filter(s => String(s.semesterNumber) === filterSem);

  const unscheduled = filteredSections.filter(s => !assignedIds.has(s.id));
  const scheduled   = filteredSections.filter(s =>  assignedIds.has(s.id));

  // ── Drag handlers ──────────────────────────────────────────────────────
  const onDragStart = (e: React.DragEvent, section: Section) => {
    setDraggedSection(section);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent, dayBit: number, hour: number) => {
    e.preventDefault();
    if (!draggedSection) return;
    const startSlot = (hour * 60) / 5;
    setAssignDialog({ section: draggedSection, dayBit, startSlot });
    setSelPattern("");
    setSelTeacher("");
    setSelRoom("");
    setDraggedSection(null);
  };

  // ── Click on empty cell ────────────────────────────────────────────────
  const onCellClick = (section: Section | null, dayBit: number, hour: number) => {
    if (!section || assignedIds.has(section.id)) return;
    const startSlot = (hour * 60) / 5;
    setAssignDialog({ section, dayBit, startSlot });
    setSelPattern("");
    setSelTeacher("");
    setSelRoom("");
  };

  // ── Submit assignment ──────────────────────────────────────────────────
  const submitAssign = async () => {
    if (!assignDialog || !selTeacher || !selRoom || !selPattern) {
      toast.error("Select teacher, room, and time pattern");
      return;
    }
    const tp = timePatterns.find(t => t.id === selPattern);
    if (!tp) return;
    setSaving(true);
    const res = await assignSection({
      solutionId: solution.id,
      sectionId: assignDialog.section.id,
      timePatternId: tp.id,
      slot: tp.slot,
      daysCode: tp.daysCode,
      roomId: selRoom,
      instructorId: selTeacher,
    });
    setSaving(false);
    if ("error" in res) { toast.error(res.error); return; }
    const sec = assignDialog.section;
    const room = rooms.find(r => r.id === selRoom);
    const teacher = teachers.find(t => t.id === selTeacher);
    const newA: Assignment = {
      id: res.assignment.id,
      slot: tp.slot,
      daysCode: tp.daysCode,
      section: {
        id: sec.id, sectionCode: sec.sectionCode, semesterNumber: sec.semesterNumber,
        course: { id: sec.course.id, code: sec.course.code, name: sec.course.name, creditHours: sec.course.creditHours },
      },
      instructor: teacher ? { id: teacher.id, employeeCode: teacher.employeeCode, user: { name: teacher.user.name } } : null,
      room: room ? { id: room.id, code: room.code, name: room.name, capacity: room.capacity, roomType: room.roomType } : null,
      timePattern: tp,
    };
    setAssignments(prev => [...prev.filter(a => a.section.id !== sec.id), newA]);
    setAssignDialog(null);
    toast.success(`${sec.course.code}-${sec.sectionCode} assigned`);
  };

  // ── Remove assignment ─────────────────────────────────────────────────
  const removeAssignment = async (assignmentId: string) => {
    await unassignSection(assignmentId);
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    setDetailDialog(null);
    toast.success("Section unassigned");
  };

  // ── Publish ───────────────────────────────────────────────────────────
  const handlePublish = async () => {
    setSaving(true);
    const res = await publishSolution(solution.id);
    setSaving(false);
    if ("error" in res) { toast.error(res.error); return; }
    toast.success("Schedule published!");
  };

  // ── Jummah break: Friday 12:30-14:00 → slots 150-168 ─────────────────
  const isJummah = (dayBit: number, hour: number) => dayBit === 16 && (hour === 12 || hour === 13);

  // ── Build grid: assignments per (day, hour) ───────────────────────────
  const gridMap = new Map<string, Assignment[]>();
  for (const a of assignments) {
    const startH = slotToHour(a.slot);
    const endH   = slotToHour(a.slot + a.timePattern.slotsPerMtg);
    DAY_BITS.forEach((bit, di) => {
      if (!(a.daysCode & bit)) return;
      for (let h = Math.floor(startH); h < Math.ceil(endH); h++) {
        const k = `${di}-${h}`;
        if (!gridMap.has(k)) gridMap.set(k, []);
        gridMap.get(k)!.push(a);
      }
    });
  }

  const uniqueSemNums = Array.from(new Set(sections.map(s => s.semesterNumber))).sort();

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">

      {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-border bg-white flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Sections</p>
            <Badge variant="secondary" className="text-xs">{unscheduled.length} unplaced</Badge>
          </div>
          <Select value={filterSem} onValueChange={setFilterSem}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Filter by semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {uniqueSemNums.map(n => (
                <SelectItem key={n} value={String(n)}>Semester {n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Unscheduled */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          {unscheduled.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">All sections scheduled!</p>
            </div>
          ) : (
            unscheduled.map(sec => {
              const hidden = hiddenSections.has(sec.id);
              const colorIdx = (sec.semesterNumber - 1) % SEM_COLORS.length;
              return (
                <div
                  key={sec.id}
                  draggable={!hidden}
                  onDragStart={(e) => !hidden && onDragStart(e, sec)}
                  className={cn(
                    "group rounded-lg border px-3 py-2 cursor-grab active:cursor-grabbing transition-all",
                    hidden ? "opacity-40" : SEM_LIGHT[colorIdx],
                    "hover:shadow-sm"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-gray-900">{sec.course.code}</span>
                        <Badge className={cn("text-[9px] h-4 px-1.5 font-bold border-0", SEM_COLORS[colorIdx])}>
                          {sec.sectionCode}
                        </Badge>
                        <span className="text-[9px] text-gray-500 ml-auto">Sem {sec.semesterNumber}</span>
                      </div>
                      <p className="text-[10px] text-gray-600 truncate mt-0.5">{sec.course.name}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{sec.course.creditHours} cr · cap {sec.capacity}</p>
                    </div>
                    <button
                      onClick={() => setHiddenSections(prev => {
                        const n = new Set(prev);
                        n.has(sec.id) ? n.delete(sec.id) : n.add(sec.id);
                        return n;
                      })}
                      className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      {hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Scheduled sections in sidebar */}
          {scheduled.length > 0 && (
            <>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pt-3 pb-1 px-1">
                Placed ({scheduled.length})
              </p>
              {scheduled.map(sec => {
                const asgn = assignments.find(a => a.section.id === sec.id);
                const colorIdx = (sec.semesterNumber - 1) % SEM_COLORS.length;
                return (
                  <div key={sec.id} className={cn("rounded-lg border px-3 py-2 opacity-60", SEM_LIGHT[colorIdx])}>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="text-[11px] font-bold text-gray-700">{sec.course.code}-{sec.sectionCode}</span>
                      {asgn && <span className="text-[9px] text-gray-400 ml-auto">{slotToHHMM(asgn.slot)}</span>}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Publish button */}
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full shrink-0", solution.status === "PUBLISHED" ? "bg-emerald-500" : "bg-amber-500")} />
            <span className="text-[11px] text-gray-500">{solution.status === "PUBLISHED" ? "Published" : "Draft"}</span>
          </div>
          <Button size="sm" className="w-full text-xs h-8 gap-1.5" onClick={handlePublish} disabled={saving}>
            <Send className="w-3 h-3" />
            {solution.status === "PUBLISHED" ? "Re-publish" : "Publish Schedule"}
          </Button>
          <Button size="sm" variant="outline" className="w-full text-xs h-8 gap-1.5" onClick={() => window.print()}>
            <Printer className="w-3 h-3" />
            Print
          </Button>
        </div>
      </div>

      {/* ── TIMETABLE GRID ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="min-w-[900px]">

          {/* Day headers */}
          <div className="sticky top-0 z-20 grid bg-white border-b border-gray-200 shadow-sm"
            style={{ gridTemplateColumns: "56px repeat(6, 1fr)" }}>
            <div className="border-r border-gray-200" />
            {DAYS.map((day, di) => (
              <div key={day} className={cn("py-2.5 text-center border-r border-gray-200 last:border-0",
                di === 4 && "bg-amber-50" /* Friday */
              )}>
                <p className="text-xs font-semibold text-gray-700">{day}</p>
                {di === 4 && <p className="text-[9px] text-amber-600">Jummah</p>}
              </div>
            ))}
          </div>

          {/* Time rows */}
          <div className="relative">
            {HOURS.map(hour => (
              <div key={hour} className="grid border-b border-gray-100"
                style={{ gridTemplateColumns: "56px repeat(6, 1fr)", minHeight: SLOT_HEIGHT }}>
                {/* Time label */}
                <div className="border-r border-gray-200 flex items-start justify-end pr-2 pt-1">
                  <span className="text-[10px] text-gray-400 font-mono">{String(hour).padStart(2,"0")}:00</span>
                </div>

                {/* Day cells */}
                {DAYS.map((day, di) => {
                  const dayBit = DAY_BITS[di];
                  const key = `${di}-${hour}`;
                  const cellAssignments = gridMap.get(key) || [];
                  const jummah = isJummah(dayBit, hour);

                  return (
                    <div
                      key={day}
                      onDragOver={jummah ? undefined : onDragOver}
                      onDrop={jummah ? undefined : (e) => onDrop(e, dayBit, hour)}
                      className={cn(
                        "relative border-r border-gray-100 last:border-0 transition-colors",
                        jummah ? "bg-amber-50" : "hover:bg-primary/5",
                        di === 4 && !jummah && "bg-amber-50/30",
                        draggedSection && !jummah && "hover:bg-primary/10 cursor-copy",
                      )}
                      style={{ minHeight: SLOT_HEIGHT }}
                    >
                      {jummah && hour === 12 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-[9px] text-amber-600 font-medium tracking-wide">Jummah Break</span>
                        </div>
                      )}

                      {/* Blocks for assignments that START in this hour */}
                      {cellAssignments
                        .filter(a => {
                          const startH = slotToHour(a.slot);
                          return Math.floor(startH) === hour;
                        })
                        .map(a => {
                          const startH = slotToHour(a.slot);
                          const durH = a.timePattern.slotsPerMtg * 5 / 60;
                          const colorIdx = (a.section.semesterNumber - 1) % SEM_COLORS.length;
                          const topOffset = (startH - hour) * SLOT_HEIGHT;
                          const height = durH * SLOT_HEIGHT - 2;

                          return (
                            <div
                              key={a.id}
                              onClick={() => setDetailDialog(a)}
                              className={cn(
                                "absolute left-0.5 right-0.5 rounded-md border cursor-pointer z-10 p-1 overflow-hidden",
                                SEM_COLORS[colorIdx],
                                "hover:brightness-110 transition-all shadow-sm"
                              )}
                              style={{ top: topOffset, height, minHeight: 28 }}
                            >
                              <p className="text-[9px] font-bold leading-tight truncate">{a.section.course.code}-{a.section.sectionCode}</p>
                              {height > 36 && <p className="text-[8px] leading-tight truncate opacity-90">{a.section.course.name}</p>}
                              {height > 52 && a.room && <p className="text-[8px] leading-tight opacity-75 truncate">{a.room.code}</p>}
                              {height > 66 && a.instructor && <p className="text-[8px] leading-tight opacity-75 truncate">{a.instructor.user.name.split(" ").pop()}</p>}
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── ASSIGN DIALOG ─────────────────────────────────────────────── */}
      <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Assign Section
              {assignDialog && (
                <span className="text-primary ml-2">{assignDialog.section.course.code} - {assignDialog.section.sectionCode}</span>
              )}
            </DialogTitle>
          </DialogHeader>
          {assignDialog && (
            <div className="space-y-4 py-2">
              <div className={cn("rounded-lg p-3 border", SEM_LIGHT[(assignDialog.section.semesterNumber - 1) % SEM_LIGHT.length])}>
                <p className="text-xs font-semibold text-gray-900">{assignDialog.section.course.name}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {assignDialog.section.course.creditHours} credit hrs · Sem {assignDialog.section.semesterNumber} · {assignDialog.section.program?.code}
                </p>
              </div>

              {/* Time Pattern */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Time Pattern</label>
                <Select value={selPattern} onValueChange={setSelPattern}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select time pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    {timePatterns.map(tp => (
                      <SelectItem key={tp.id} value={tp.id}>
                        {tp.name} ({tp.minPerMtg} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Teacher */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Instructor</label>
                <Select value={selTeacher} onValueChange={setSelTeacher}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.user.name} — {t.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Room */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Room</label>
                <Select value={selRoom} onValueChange={setSelRoom}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.code} — {r.name} (cap {r.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAssignDialog(null)}>Cancel</Button>
            <Button size="sm" onClick={submitAssign} disabled={saving}>
              {saving ? "Saving..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DETAIL DIALOG ─────────────────────────────────────────────── */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Assignment Details</DialogTitle>
          </DialogHeader>
          {detailDialog && (
            <div className="space-y-3 py-2">
              <div className={cn("rounded-lg p-3 border", SEM_LIGHT[(detailDialog.section.semesterNumber - 1) % SEM_LIGHT.length])}>
                <p className="text-xs font-bold text-gray-900">{detailDialog.section.course.code} — {detailDialog.section.sectionCode}</p>
                <p className="text-[11px] text-gray-600 mt-0.5">{detailDialog.section.course.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Time</p>
                  <p className="text-gray-900">{detailDialog.timePattern.name}</p>
                  <p className="text-gray-500">{slotToHHMM(detailDialog.slot)} · {detailDialog.timePattern.minPerMtg} min</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Room</p>
                  <p className="text-gray-900">{detailDialog.room?.code ?? "TBA"}</p>
                  <p className="text-gray-500">{detailDialog.room?.name}</p>
                </div>
                <div className="space-y-0.5 col-span-2">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Instructor</p>
                  <p className="text-gray-900">{detailDialog.instructor?.user.name ?? "TBA"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="destructive" size="sm"
              onClick={() => detailDialog && removeAssignment(detailDialog.id)}
            >
              <X className="w-3 h-3 mr-1" /> Unassign
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDetailDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
