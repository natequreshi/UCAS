import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { RoomsClient } from "@/components/rooms/rooms-client";

export const metadata = { title: "Rooms & Buildings" };

export default async function RoomsPage() {
  const [buildings, rooms] = await Promise.all([
    prisma.building.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { rooms: true } } },
    }),
    prisma.room.findMany({
      orderBy: [{ building: { name: "asc" } }, { code: "asc" }],
      include: { building: true },
    }),
  ]);

  return (
    <>
      <Header
        title="Rooms & Buildings"
        subtitle="Manage lecture halls, labs, and building infrastructure"
      />
      <main className="flex-1 p-6">
        <RoomsClient buildings={buildings} rooms={rooms} />
      </main>
    </>
  );
}
