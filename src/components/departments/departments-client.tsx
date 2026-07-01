"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { Department } from "@prisma/client";
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
import { DepartmentForm } from "@/components/departments/department-form";
import { deleteDepartment } from "@/app/(dashboard)/departments/actions";

type DeptWithCount = Department & {
  _count: { programs: number; teachers: number; courses: number };
};

interface DepartmentsClientProps {
  departments: DeptWithCount[];
}

export function DepartmentsClient({ departments }: DepartmentsClientProps) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (dept: Department) => {
    setSelectedDept(dept);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedDept(null);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    const result = await deleteDepartment(deletingId);
    setDeleting(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Department deleted.");
      setConfirmOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle={`${departments.length} department${departments.length !== 1 ? "s" : ""}`}
        action={
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Department
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
          title={search ? "No results found" : "No departments yet"}
          description={
            search
              ? "Try adjusting your search."
              : "Create the first department to get started."
          }
          action={
            !search ? (
              <Button onClick={handleAdd} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-28">Abbreviation</TableHead>
                <TableHead className="w-24 text-center">Programs</TableHead>
                <TableHead className="w-24 text-center">Teachers</TableHead>
                <TableHead className="w-24 text-center">Courses</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell>
                    <span className="font-mono text-sm font-medium">
                      {dept.code}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {dept.abbreviation ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {dept._count.programs}
                  </TableCell>
                  <TableCell className="text-center">
                    {dept._count.teachers}
                  </TableCell>
                  <TableCell className="text-center">
                    {dept._count.courses}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={dept.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {dept.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(dept)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(dept.id)}
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

      <DepartmentForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        department={selectedDept}
        onSuccess={() => {}}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Department"
        description="This action cannot be undone. The department will be permanently removed."
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
}
