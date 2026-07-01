"use client";

import { useState } from "react";
import {
  format,
  addDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfISOWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

// University hours: 08:00 – 17:00
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

// Mon-Sat (Pakistan university standard)
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Week calendar headers (Mon-first)
const WEEK_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_HEADERS_SINGLE = ["M", "T", "W", "T", "F", "S", "S"];

function fmt(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

// Friday (dayIndex 4 in Mon-Sat array) 12:00 and 13:00 = Jummah
function isJummah(dayIdx: number, hour: number) {
  return dayIdx === 4 && (hour === 12 || hour === 13);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActiveSemester {
  name: string;
  startDate: string;
  endDate: string;
}

interface CalendarViewProps {
  activeSemester?: ActiveSemester | null;
}

// ─── Root component ───────────────────────────────────────────────────────────

export function CalendarView({ activeSemester }: CalendarViewProps) {
  const [tab, setTab] = useState<"week" | "month" | "quarter">("week");
  const [baseDate, setBaseDate] = useState(() => new Date());

  const weekStart = startOfISOWeek(baseDate); // always Monday

  function goToToday() {
    setBaseDate(new Date());
  }

  return (
    <Card className="border-border overflow-hidden">
      {/* ── Header ── */}
      <CardHeader className="border-b border-border pb-0 pt-4 px-5">
        <div className="flex items-start justify-between gap-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 leading-none">
                Academic Calendar
              </h2>
              {activeSemester ? (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeSemester.name}&nbsp;·&nbsp;
                  {format(new Date(activeSemester.startDate), "d MMM")}
                  &nbsp;–&nbsp;
                  {format(new Date(activeSemester.endDate), "d MMM yyyy")}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">
                  No active semester · set one via{" "}
                  <a href="/semesters" className="text-primary hover:underline">
                    Semesters
                  </a>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={goToToday}
            >
              Today
            </Button>
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as typeof tab)}
            >
              <TabsList className="h-7">
                <TabsTrigger value="week" className="text-xs h-5 px-3">
                  Week
                </TabsTrigger>
                <TabsTrigger value="month" className="text-xs h-5 px-3">
                  Month
                </TabsTrigger>
                <TabsTrigger value="quarter" className="text-xs h-5 px-3">
                  3 Months
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      {/* ── Body ── */}
      <CardContent className="p-0">
        {tab === "week" && (
          <WeekView
            baseDate={baseDate}
            weekStart={weekStart}
            onPrev={() => setBaseDate((d) => subWeeks(d, 1))}
            onNext={() => setBaseDate((d) => addWeeks(d, 1))}
          />
        )}
        {tab === "month" && (
          <MonthView
            baseDate={baseDate}
            onPrev={() => setBaseDate((d) => subMonths(d, 1))}
            onNext={() => setBaseDate((d) => addMonths(d, 1))}
          />
        )}
        {tab === "quarter" && <QuarterView baseDate={baseDate} />}
      </CardContent>
    </Card>
  );
}

// ─── Week timetable view ──────────────────────────────────────────────────────

function WeekView({
  baseDate,
  weekStart,
  onPrev,
  onNext,
}: {
  baseDate: Date;
  weekStart: Date;
  onPrev: () => void;
  onNext: () => void;
}) {
  // Mon-Sat for the current week
  const days = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));

  return (
    <div>
      {/* Nav row */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-muted/20">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onPrev}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-medium text-gray-700 tabular-nums w-44 text-center">
            {format(weekStart, "d MMM")} – {format(addDays(weekStart, 5), "d MMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onNext}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-300 inline-block" />
            Jummah break
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary/10 border border-primary/30 inline-block" />
            Today
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr>
              {/* Time column header */}
              <th className="w-14 border-r border-b border-border bg-muted/30 p-0" />
              {days.map((day, i) => {
                const todayCol = isToday(day);
                return (
                  <th
                    key={i}
                    className={cn(
                      "border-r border-b border-border p-2 text-center",
                      i === 5 && "border-r-0",
                      todayCol ? "bg-primary/5" : "bg-muted/30"
                    )}
                  >
                    <span
                      className={cn(
                        "block text-[10px] font-semibold uppercase tracking-wider mb-1",
                        todayCol ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {DAY_SHORT[i]}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold",
                        todayCol
                          ? "bg-primary text-white"
                          : "text-gray-700"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour}>
                {/* Time label */}
                <td className="border-r border-b border-border text-[10px] text-muted-foreground text-right pr-2 align-top pt-1 w-14 bg-muted/10 select-none">
                  {fmt(hour)}
                </td>
                {days.map((day, dayIdx) => {
                  const jummah = isJummah(dayIdx, hour);
                  const todayCol = isToday(day);

                  return (
                    <td
                      key={dayIdx}
                      className={cn(
                        "border-r border-b border-border p-0.5 relative h-12",
                        dayIdx === 5 && "border-r-0",
                        todayCol && !jummah && "bg-primary/[0.02]",
                        jummah && "bg-amber-50 p-0"
                      )}
                    >
                      {jummah && hour === 12 && (
                        // rowSpan visual trick: we draw an absolute overlay for the 2-hour block
                        // (actual rowspan not possible in React easily; we use absolute on hour=12 only)
                        <div className="absolute inset-0 m-0.5 rounded bg-amber-100 border border-amber-200 flex flex-col items-center justify-center z-10 pointer-events-none">
                          <span className="text-[9px] font-semibold text-amber-700 uppercase tracking-wide">
                            Jummah
                          </span>
                          <span className="text-[9px] text-amber-600">
                            12:30 – 14:00
                          </span>
                        </div>
                      )}
                      {/* Hide the 13:00 Jummah cell content (covered by the overlay above) */}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-5 py-2.5 flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">
          No classes scheduled this week.{" "}
          <a href="/schedule" className="text-primary hover:underline">
            Generate a timetable
          </a>{" "}
          to populate the grid.
        </p>
      </div>
    </div>
  );
}

// ─── Month calendar view ──────────────────────────────────────────────────────

function MonthView({
  baseDate,
  onPrev,
  onNext,
}: {
  baseDate: Date;
  onPrev: () => void;
  onNext: () => void;
}) {
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(baseDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div>
      {/* Nav */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-muted/20">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onPrev}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-semibold text-gray-900 min-w-[120px] text-center">
            {format(baseDate, "MMMM yyyy")}
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onNext}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Badge variant="secondary" className="text-[10px] h-5">
          {format(baseDate, "yyyy")}
        </Badge>
      </div>

      {/* Calendar */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEK_HEADERS.map((d, i) => (
            <div
              key={i}
              className={cn(
                "text-center text-[10px] font-semibold uppercase tracking-wider py-1.5",
                i >= 5 ? "text-muted-foreground/60" : "text-muted-foreground"
              )}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 border-l border-t border-border rounded-lg overflow-hidden shadow-sm">
          {days.map((day, i) => {
            const inMonth = isSameMonth(day, baseDate);
            const today = isToday(day);
            const dow = day.getDay(); // 0=Sun,6=Sat
            const isWeekend = dow === 0 || dow === 6;

            return (
              <div
                key={i}
                className={cn(
                  "border-r border-b border-border min-h-[72px] p-1.5 relative",
                  !inMonth && "bg-muted/20",
                  isWeekend && inMonth && "bg-muted/10",
                  today && "bg-primary/5"
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                    today
                      ? "bg-primary text-white font-bold"
                      : !inMonth
                      ? "text-gray-300"
                      : isWeekend
                      ? "text-muted-foreground"
                      : "text-gray-700"
                  )}
                >
                  {format(day, "d")}
                </span>
                {/* Placeholder for future events */}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <Separator />
      <div className="px-5 py-2.5 flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">
          No events this month.{" "}
          <a href="/semesters" className="text-primary hover:underline">
            Configure a semester
          </a>{" "}
          to see academic dates.
        </p>
      </div>
    </div>
  );
}

// ─── Quarter (3-month) view ───────────────────────────────────────────────────

function MiniMonth({ date }: { date: Date }) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-900 mb-2 text-center tracking-wide">
        {format(date, "MMMM yyyy")}
      </h3>

      <div className="grid grid-cols-7">
        {WEEK_HEADERS_SINGLE.map((d, i) => (
          <div
            key={i}
            className="text-center text-[9px] font-semibold uppercase text-muted-foreground py-0.5"
          >
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, date);
          const today = isToday(day);
          return (
            <div key={i} className="flex items-center justify-center py-[1px]">
              <span
                className={cn(
                  "w-5 h-5 inline-flex items-center justify-center rounded-full text-[10px]",
                  today
                    ? "bg-primary text-white font-bold"
                    : !inMonth
                    ? "text-gray-200"
                    : "text-gray-700 hover:bg-muted"
                )}
              >
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuarterView({ baseDate }: { baseDate: Date }) {
  return (
    <div className="p-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <MiniMonth date={subMonths(baseDate, 1)} />
        <div className="relative">
          <div className="absolute -inset-3 rounded-xl bg-primary/5 border border-primary/10 hidden sm:block" />
          <div className="relative">
            <MiniMonth date={baseDate} />
          </div>
        </div>
        <MiniMonth date={addMonths(baseDate, 1)} />
      </div>

      <Separator className="my-4" />
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">
          No academic events scheduled.{" "}
          <a href="/schedule" className="text-primary hover:underline">
            Generate a schedule
          </a>{" "}
          to populate events.
        </p>
      </div>
    </div>
  );
}
