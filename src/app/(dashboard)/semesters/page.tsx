import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { SemestersClient } from "@/components/semesters/semesters-client";

export const metadata = { title: "Semesters" };

export default async function SemestersPage() {
  const semesters = await prisma.academicSemester.findMany({
    orderBy: [{ year: "desc" }, { semesterType: "asc" }],
  });

  return (
    <>
      <Header
        title="Semesters"
        subtitle="Manage academic semesters and set the current active semester"
      />
      <main className="flex-1 p-6">
        <SemestersClient semesters={semesters} />
      </main>
    </>
  );
}
