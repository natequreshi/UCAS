"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Star } from "lucide-react";
import type { AcademicSemester } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { SemesterForm } from "@/components/semesters/semester-form";
import {
  deleteSemester,
  setCurrentSemester,
} from "@/app/(dashboard)/semesters/actions";
import { formatDate } from "@/lib/utils";

const TYPE_BADGE: Record<string, string> = {
  FALL: "bg-orange-50 text-orange-700 border-orange-200",
  SPRING: "bg-green-50 text-green-700 border-green-200",
  SUMMER: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

interface SemestersClientProps {
  semesters: AcademicSemester[];
}

export function SemestersClient({ semesters }: SemestersClientProps) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSem, setSelectedSem] = useState<AcademicSemester | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [settingCurrent, setSettingCurrent] = useState<string | null>(null);

  const filtered = semesters.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (sem: AcademicSemester) => {
    setSelectedSem(sem);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedSem(null);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    const result = await deleteSemester(deletingId);
    setDeleting(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Semester deleted.");
      setConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const handleSetCurrent = async (id: string) => {
    setSettingCurrent(id);
    const result = await setCurrentSemester(id);
    setSettingCurrent(null);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Current semester updated.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Semesters"
        subtitle={`${semesters.length} semester${semesters.length !== 1 ? "s" : ""}`}
        action={
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Semester
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or code…"
          className="max-w-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? "No results found" : "No semesters yet"}
          description={
            search
              ? "Try adjusting your search."
              : "Add the first academic semester to get started."
          }
          action={
            !search ? (
              <Button onClick={handleAdd} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Semester
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
                <TableHead className="w-28">Type</TableHead>
                <TableHead className="w-20 text-center">Year</TableHead>
                <TableHead className="w-32">Start</TableHead>
                <TableHead className="w-32">End</TableHead>
                <TableHead className="w-24 text-center">Current</TableHead>
                <TableHead className="w-20 text-center">Summer</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-36 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sem) => (
                <TableRow key={sem.id} className={sem.isCurrent ? "bg-primary/5" : ""}>
                  <TableCell>
                    <span className="font-mono text-sm font-medium">
                      {sem.code}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{sem.name}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        TYPE_BADGE[sem.semesterType] ?? ""
                      }`}
                    >
                      {sem.semesterType.charAt(0) +
                        sem.semesterType.slice(1).toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {sem.year}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(sem.startDate)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(sem.endDate)}
                  </TableCell>
                  <TableCell className="text-center">
                    {sem.isCurrent ? (
                      <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                        <Star className="h-3 w-3 mr-1" />
                        Current
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {sem.isSummer ? (
                      <Badge variant="secondary" className="text-xs">
                        Summer
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={sem.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {sem.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!sem.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => handleSetCurrent(sem.id)}
                          disabled={settingCurrent === sem.id}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Set Current
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(sem)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(sem.id)}
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

      <SemesterForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        semester={selectedSem}
        onSuccess={() => {}}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Semester"
        description="This action cannot be undone. The semester will be permanently removed."
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
}
