import { getScheduleData, getSemesters } from "@/lib/schedule-actions";
import { ScheduleBoard } from "@/components/schedule/schedule-board";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Schedule Maker — UCAS" };

interface Props {
  searchParams: Promise<{ sem?: string }> | { sem?: string };
}

export default async function SchedulePage({ searchParams }: Props) {
  const sp = await Promise.resolve(searchParams);
  const [data, semesters] = await Promise.all([
    getScheduleData((sp as { sem?: string }).sem),
    getSemesters(),
  ]);

  if (!data.semester) {
    return (
      <>
        <Header title="Schedule Maker" subtitle="No active semester found" />
        <main className="flex-1 p-6">
          <div className="max-w-sm mx-auto mt-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No Current Semester</h2>
            <p className="text-sm text-muted-foreground">
              Mark a semester as &quot;current&quot; in the Semesters module to activate the Schedule Maker.
            </p>
          </div>
        </main>
      </>
    );
  }

  const totalSections  = data.sections.length;
  const assignedCount  = data.assignments.length;
  const unassignedCount = totalSections - new Set(data.assignments.map(a => a.section.id)).size;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Top bar ── */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-border bg-white">
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">Schedule Maker</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">{data.semester.name}</span>
            <Badge variant="secondary" className="text-[10px] h-4">
              {data.solution?.status ?? "DRAFT"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
            <span><strong className="text-gray-900">{totalSections}</strong> sections</span>
            <span className="text-gray-300">|</span>
            <span className="text-emerald-600"><strong>{assignedCount}</strong> placed</span>
            <span className="text-gray-300">|</span>
            <span className="text-amber-600"><strong>{unassignedCount}</strong> unplaced</span>
          </div>

          {/* Semester switcher */}
          <div className="flex items-center gap-1">
            {semesters.map(s => (
              <a
                key={s.id}
                href={`/schedule?sem=${s.id}`}
                className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                  s.id === data.semester!.id
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {s.code}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-1.5 border-b border-gray-100 bg-gray-50/80 overflow-x-auto">
        <span className="text-[10px] text-gray-400 shrink-0">Semester:</span>
        {[1,2,3,4,5,6,7,8].map(n => {
          const colors = ["bg-blue-500","bg-violet-500","bg-teal-500","bg-emerald-500","bg-amber-500","bg-orange-500","bg-rose-500","bg-pink-500"];
          return (
            <div key={n} className="flex items-center gap-1 shrink-0">
              <div className={`w-2 h-2 rounded-full ${colors[n-1]}`} />
              <span className="text-[10px] text-gray-500">{n}</span>
            </div>
          );
        })}
        <span className="text-[10px] text-gray-300 ml-2 shrink-0">|</span>
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-2 h-2 rounded bg-amber-200" />
          <span className="text-[10px] text-amber-600">Jummah break</span>
        </div>
        <span className="text-[10px] text-gray-400 ml-auto shrink-0 hidden md:block">
          Drag sections from left panel onto the grid to schedule them
        </span>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <ScheduleBoard
          sections={data.sections as any}
          assignments={data.assignments as any}
          rooms={data.rooms as any}
          teachers={data.teachers as any}
          timePatterns={data.timePatterns as any}
          solution={data.solution!}
        />
      </div>
    </div>
  );
}
