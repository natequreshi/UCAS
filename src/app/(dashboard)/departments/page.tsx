import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { DepartmentsClient } from "@/components/departments/departments-client";

export const metadata = { title: "Departments" };

export default async function DepartmentsPage() {
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { programs: true, teachers: true, courses: true },
      },
    },
  });

  return (
    <>
      <Header
        title="Departments"
        subtitle="Manage academic departments and their programs"
      />
      <main className="flex-1 p-6">
        <DepartmentsClient departments={departments} />
      </main>
    </>
  );
}
