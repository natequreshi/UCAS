"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check, Minus } from "lucide-react";
import type { Building, Room } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { BuildingForm } from "@/components/rooms/building-form";
import { RoomForm } from "@/components/rooms/room-form";
import { deleteBuilding, deleteRoom } from "@/app/(dashboard)/rooms/actions";

type BuildingWithCount = Building & { _count: { rooms: number } };
type RoomWithBuilding = Room & { building: Building };

interface RoomsClientProps {
  buildings: BuildingWithCount[];
  rooms: RoomWithBuilding[];
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  LECTURE_HALL: "Lecture Hall",
  LAB_COMPUTER: "Computer Lab",
  LAB_PHYSICS: "Physics Lab",
  LAB_CHEMISTRY: "Chemistry Lab",
  LAB_ELECTRONICS: "Electronics Lab",
  SEMINAR_ROOM: "Seminar Room",
  AUDITORIUM: "Auditorium",
};

const ROOM_TYPE_BADGE: Record<string, string> = {
  LECTURE_HALL: "bg-blue-50 text-blue-700 border-blue-200",
  LAB_COMPUTER: "bg-green-50 text-green-700 border-green-200",
  LAB_PHYSICS: "bg-yellow-50 text-yellow-700 border-yellow-200",
  LAB_CHEMISTRY: "bg-orange-50 text-orange-700 border-orange-200",
  LAB_ELECTRONICS: "bg-purple-50 text-purple-700 border-purple-200",
  SEMINAR_ROOM: "bg-cyan-50 text-cyan-700 border-cyan-200",
  AUDITORIUM: "bg-red-50 text-red-700 border-red-200",
};

export function RoomsClient({ buildings, rooms }: RoomsClientProps) {
  const [bSearch, setBSearch] = useState("");
  const [rSearch, setRSearch] = useState("");

  // Building dialog state
  const [bDialogOpen, setBDialogOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingWithCount | null>(null);
  const [bConfirmOpen, setBConfirmOpen] = useState(false);
  const [bDeletingId, setBDeletingId] = useState<string | null>(null);
  const [bDeleting, setBDeleting] = useState(false);

  // Room dialog state
  const [rDialogOpen, setRDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomWithBuilding | null>(null);
  const [rConfirmOpen, setRConfirmOpen] = useState(false);
  const [rDeletingId, setRDeletingId] = useState<string | null>(null);
  const [rDeleting, setRDeleting] = useState(false);

  const filteredBuildings = buildings.filter(
    (b) =>
      b.name.toLowerCase().includes(bSearch.toLowerCase()) ||
      b.code.toLowerCase().includes(bSearch.toLowerCase())
  );

  const filteredRooms = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(rSearch.toLowerCase()) ||
      r.code.toLowerCase().includes(rSearch.toLowerCase()) ||
      r.building.name.toLowerCase().includes(rSearch.toLowerCase())
  );

  // Building handlers
  const handleBEdit = (b: BuildingWithCount) => {
    setSelectedBuilding(b);
    setBDialogOpen(true);
  };
  const handleBAdd = () => {
    setSelectedBuilding(null);
    setBDialogOpen(true);
  };
  const handleBDeleteClick = (id: string) => {
    setBDeletingId(id);
    setBConfirmOpen(true);
  };
  const handleBConfirmDelete = async () => {
    if (!bDeletingId) return;
    setBDeleting(true);
    const result = await deleteBuilding(bDeletingId);
    setBDeleting(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Building deleted.");
      setBConfirmOpen(false);
      setBDeletingId(null);
    }
  };

  // Room handlers
  const handleREdit = (r: RoomWithBuilding) => {
    setSelectedRoom(r);
    setRDialogOpen(true);
  };
  const handleRAdd = () => {
    setSelectedRoom(null);
    setRDialogOpen(true);
  };
  const handleRDeleteClick = (id: string) => {
    setRDeletingId(id);
    setRConfirmOpen(true);
  };
  const handleRConfirmDelete = async () => {
    if (!rDeletingId) return;
    setRDeleting(true);
    const result = await deleteRoom(rDeletingId);
    setRDeleting(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Room deleted.");
      setRConfirmOpen(false);
      setRDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Rooms & Buildings"
        subtitle={`${buildings.length} building${buildings.length !== 1 ? "s" : ""}, ${rooms.length} room${rooms.length !== 1 ? "s" : ""}`}
      />

      <Tabs defaultValue="buildings">
        <TabsList className="mb-4">
          <TabsTrigger value="buildings">
            Buildings ({buildings.length})
          </TabsTrigger>
          <TabsTrigger value="rooms">Rooms ({rooms.length})</TabsTrigger>
        </TabsList>

        {/* ── Buildings Tab ── */}
        <TabsContent value="buildings">
          <div className="flex items-center justify-between mb-4">
            <SearchInput
              value={bSearch}
              onChange={setBSearch}
              placeholder="Search buildings…"
              className="max-w-sm"
            />
            <Button onClick={handleBAdd} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Building
            </Button>
          </div>

          {filteredBuildings.length === 0 ? (
            <EmptyState
              title={bSearch ? "No results found" : "No buildings yet"}
              description={
                bSearch
                  ? "Try adjusting your search."
                  : "Add the first building to get started."
              }
              action={
                !bSearch ? (
                  <Button onClick={handleBAdd} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Building
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="rounded-lg border bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-32">Abbreviation</TableHead>
                    <TableHead className="w-24 text-center">Rooms</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-20 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuildings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <span className="font-mono text-sm font-medium">
                          {b.code}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {b.abbreviation ?? "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {b._count.rooms}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={b.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {b.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleBEdit(b)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleBDeleteClick(b.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ── Rooms Tab ── */}
        <TabsContent value="rooms">
          <div className="flex items-center justify-between mb-4">
            <SearchInput
              value={rSearch}
              onChange={setRSearch}
              placeholder="Search rooms…"
              className="max-w-sm"
            />
            <Button onClick={handleRAdd} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </div>

          {filteredRooms.length === 0 ? (
            <EmptyState
              title={rSearch ? "No results found" : "No rooms yet"}
              description={
                rSearch
                  ? "Try adjusting your search."
                  : "Add the first room to get started."
              }
              action={
                !rSearch ? (
                  <Button onClick={handleRAdd} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Room
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="rounded-lg border bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-24 text-center">Capacity</TableHead>
                    <TableHead className="w-20 text-center">Projector</TableHead>
                    <TableHead className="w-16 text-center">AC</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-20 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <span className="font-mono text-sm font-medium">
                          {r.code}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {r.building.name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            ROOM_TYPE_BADGE[r.roomType] ?? ""
                          }`}
                        >
                          {ROOM_TYPE_LABELS[r.roomType] ?? r.roomType}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {r.capacity}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.hasProjector ? (
                          <Check className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.hasAC ? (
                          <Check className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={r.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {r.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleREdit(r)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRDeleteClick(r.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Building dialogs */}
      <BuildingForm
        open={bDialogOpen}
        onOpenChange={setBDialogOpen}
        building={selectedBuilding}
        onSuccess={() => {}}
      />
      <ConfirmDialog
        open={bConfirmOpen}
        onOpenChange={setBConfirmOpen}
        title="Delete Building"
        description="This action cannot be undone. The building will be permanently removed."
        onConfirm={handleBConfirmDelete}
        loading={bDeleting}
      />

      {/* Room dialogs */}
      <RoomForm
        open={rDialogOpen}
        onOpenChange={setRDialogOpen}
        room={selectedRoom}
        buildings={buildings}
        onSuccess={() => {}}
      />
      <ConfirmDialog
        open={rConfirmOpen}
        onOpenChange={setRConfirmOpen}
        title="Delete Room"
        description="This action cannot be undone. The room will be permanently removed."
        onConfirm={handleRConfirmDelete}
        loading={rDeleting}
      />
    </div>
  );
}
