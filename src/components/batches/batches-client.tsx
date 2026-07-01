"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { Batch } from "@prisma/client";
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
import { BatchForm } from "@/components/batches/batch-form";
import { deleteBatch } from "@/app/(dashboard)/batches/actions";

type BatchWithCount = Batch & { _count: { students: number } };

interface BatchesClientProps {
  batches: BatchWithCount[];
}

const TYPE_BADGE: Record<string, string> = {
  FALL: "bg-orange-50 text-orange-700 border-orange-200",
  SPRING: "bg-green-50 text-green-700 border-green-200",
};

export function BatchesClient({ batches }: BatchesClientProps) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchWithCount | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = batches.filter(
    (b) =>
      b.label.toLowerCase().includes(search.toLowerCase()) ||
      b.prefix.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (batch: BatchWithCount) => {
    setSelectedBatch(batch);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedBatch(null);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    const result = await deleteBatch(deletingId);
    setDeleting(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Batch deleted.");
      setConfirmOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Batches"
        subtitle={`${batches.length} batch${batches.length !== 1 ? "es" : ""}`}
        action={
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Batch
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by prefix or label…"
          className="max-w-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? "No results found" : "No batches yet"}
          description={
            search
              ? "Try adjusting your search."
              : "Add the first student batch to get started."
          }
          action={
            !search ? (
              <Button onClick={handleAdd} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Batch
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Prefix</TableHead>
                <TableHead>Label</TableHead>
                <TableHead className="w-20 text-center">Year</TableHead>
                <TableHead className="w-28">Type</TableHead>
                <TableHead className="w-24 text-center">Students</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <span className="font-mono text-sm font-semibold">
                      {batch.prefix}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{batch.label}</TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {batch.year}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        TYPE_BADGE[batch.semesterType] ?? ""
                      }`}
                    >
                      {batch.semesterType.charAt(0) +
                        batch.semesterType.slice(1).toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {batch._count.students}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={batch.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {batch.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(batch)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(batch.id)}
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

      <BatchForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        batch={selectedBatch}
        onSuccess={() => {}}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Batch"
        description="This action cannot be undone. The batch will be permanently removed."
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
}
