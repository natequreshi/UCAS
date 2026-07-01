import { Header } from "@/components/layout/header";

export const metadata = { title: "Schedule" };

export default function SchedulePage() {
  return (
    <>
      <Header title="Schedule" subtitle="This module is under active development" />
      <main className="flex-1 p-6">
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚧</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Schedule Module</h2>
          <p className="text-muted-foreground text-sm">
            This module is scheduled for an upcoming version. Check the dashboard roadmap for the timeline.
          </p>
        </div>
      </main>
    </>
  );
}
