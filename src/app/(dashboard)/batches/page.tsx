import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { BatchesClient } from "@/components/batches/batches-client";

export const metadata = { title: "Batches" };

export default async function BatchesPage() {
  const batches = await prisma.batch.findMany({
    orderBy: [{ year: "desc" }, { semesterType: "asc" }],
    include: { _count: { select: { students: true } } },
  });

  return (
    <>
      <Header
        title="Batches"
        subtitle="Manage student cohorts by admission semester"
      />
      <main className="flex-1 p-6">
        <BatchesClient batches={batches} />
      </main>
    </>
  );
}
