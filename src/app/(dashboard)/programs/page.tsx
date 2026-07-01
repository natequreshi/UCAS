import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { ProgramsClient } from "@/components/programs/programs-client";

export const metadata = { title: "Programs" };

export default async function ProgramsPage() {
  const [programs, departments] = await Promise.all([
    prisma.program.findMany({
      orderBy: { name: "asc" },
      include: {
        department: true,
        _count: { select: { students: true, sections: true } },
      },
    }),
    prisma.department.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <Header
        title="Programs"
        subtitle="Manage academic programs and their departments"
      />
      <main className="flex-1 p-6">
        <ProgramsClient programs={programs} departments={departments} />
      </main>
    </>
  );
}
