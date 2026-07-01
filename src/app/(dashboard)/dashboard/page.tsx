import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { DashboardHome } from "@/components/dashboard/dashboard-home";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <>
      <Header
        title="Dashboard"
        subtitle={`Welcome back, ${session?.user?.name?.split(" ")[0] ?? "User"}`}
      />
      <main className="flex-1 p-6 overflow-auto">
        <DashboardHome />
      </main>
    </>
  );
}
