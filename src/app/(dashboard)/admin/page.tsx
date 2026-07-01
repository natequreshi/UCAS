import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { AdminClient } from "@/components/admin/admin-client";

export const metadata = { title: "Administration" };

export default async function AdminPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header
        title="Administration"
        subtitle="Manage users, roles, and system access"
      />
      <main className="flex-1 p-6">
        <AdminClient users={users} />
      </main>
    </>
  );
}
