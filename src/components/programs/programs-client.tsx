"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { Department, Program } from "@prisma/client";
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
import { ProgramForm } from "@/components/programs/program-form";
import { deleteProgram } from "@/app/(dashboard)/programs/actions";

type ProgramWithDept = Program & {
  department: Department;
  _count: { students: number; sections: number };
};

interface ProgramsClientProps {
  programs: ProgramWithDept[];
  departments: Department[];
}

const LEVEL_BADGE: Record<string, string> = {
  BS: "bg-blue-100 text-blue-800 border-blue-200",
  MS: "bg-purple-100 text-purple-800 border-purple-200",
  PHD: "bg-pink-100 text-pink-800 border-pink-200",
};

const LEVEL_LABELS: Record<string, string> = {
  BS: "BS",
  MS: "MS",
  PHD: "PhD",
};

export function ProgramsClient({ programs, departments }: ProgramsClientProps) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramWithDept | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = programs.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.department.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (program: ProgramWithDept) => {
    setSelectedProgram(program);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedProgram(null);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    const result = await deleteProgram(deletingId);
    setDeleting(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Program deleted.");
      setConfirmOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Programs"
        subtitle={`${programs.length} program${programs.length !== 1 ? "s" : ""}`}
        action={
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Program
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, code, or department…"
          className="max-w-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? "No results found" : "No programs yet"}
          description={
            search
              ? "Try adjusting your search."
              : "Create the first academic program to get started."
          }
          action={
            !search ? (
              <Button onClick={handleAdd} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Program
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
                <TableHead className="w-20">Level</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="w-28">Duration</TableHead>
                <TableHead className="w-24">Credits</TableHead>
                <TableHead className="w-24 text-center">Students</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((program) => (
                <TableRow key={program.id}>
                  <TableCell>
                    <span className="font-mono text-sm font-medium">
                      {program.code}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        LEVEL_BADGE[program.level] ?? ""
                      }`}
                    >
                      {LEVEL_LABELS[program.level] ?? program.level}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {program.department.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {program.durationYears} {program.durationYears === 1 ? "year" : "years"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {program.totalCredits} cr
                  </TableCell>
                  <TableCell className="text-center">
                    {program._count.students}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={program.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {program.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(program)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(program.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProgramForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        program={selectedProgram}
        departments={departments}
        onSuccess={() => {}}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Program"
        description="This action cannot be undone. The program will be permanently removed."
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
}
