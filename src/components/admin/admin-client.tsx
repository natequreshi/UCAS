"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, KeyRound, Copy, Check } from "lucide-react";
import type { User } from "@prisma/client";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { UserForm } from "@/components/admin/user-form";
import {
  deleteUser,
  resetPassword,
} from "@/app/(dashboard)/admin/actions";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-800 border-red-200",
  ADMIN: "bg-orange-100 text-orange-800 border-orange-200",
  SCHEDULE_MANAGER: "bg-blue-100 text-blue-800 border-blue-200",
  DEPARTMENT_CHAIR: "bg-purple-100 text-purple-800 border-purple-200",
  TEACHER: "bg-green-100 text-green-800 border-green-200",
  STUDENT: "bg-cyan-100 text-cyan-800 border-cyan-200",
  VIEWER: "bg-gray-100 text-gray-700 border-gray-200",
};

interface AdminClientProps {
  users: User[];
}

export function AdminClient({ users }: AdminClientProps) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Reset password state
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetTargetId, setResetTargetId] = useState<string | null>(null);
  const [resetPassword_, setResetPassword_] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [copied, setCopied] = useState(false);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    const result = await deleteUser(deletingId);
    setDeleting(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("User deleted.");
      setConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const handleResetPassword = (id: string) => {
    setResetTargetId(id);
    setResetPassword_(null);
    setCopied(false);
    setResetDialogOpen(true);
  };

  const handleConfirmReset = async () => {
    if (!resetTargetId) return;
    setResetting(true);
    const result = await resetPassword(resetTargetId);
    setResetting(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      setResetPassword_(result.password);
    }
  };

  const handleCopy = () => {
    if (!resetPassword_) return;
    navigator.clipboard.writeText(resetPassword_);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${users.length} user${users.length !== 1 ? "s" : ""}`}
        action={
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or role…"
          className="max-w-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? "No results found" : "No users yet"}
          description={
            search
              ? "Try adjusting your search."
              : "Add the first user to get started."
          }
          action={
            !search ? (
              <Button onClick={handleAdd} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-40">Role</TableHead>
                <TableHead className="w-36">Last Login</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-28 text-center">Must Change</TableHead>
                <TableHead className="w-36 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        ROLE_BADGE[user.role] ?? ""
                      }`}
                    >
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {user.mustChangePwd ? (
                      <Badge
                        variant="outline"
                        className="text-xs text-amber-700 border-amber-300 bg-amber-50"
                      >
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Reset password"
                        onClick={() => handleResetPassword(user.id)}
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        <span className="sr-only">Reset Password</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(user.id)}
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

      <UserForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
        onSuccess={() => {}}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete User"
        description="This action cannot be undone. The user account will be permanently removed."
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {resetPassword_
                ? "A new temporary password has been generated. Share it with the user securely."
                : "This will generate a new random password and force the user to change it on next login."}
            </DialogDescription>
          </DialogHeader>

          {resetPassword_ ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">New password:</p>
              <div className="flex items-center gap-2">
                <Input
                  value={resetPassword_}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                This password will not be shown again. Copy and share it with the user now.
              </p>
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(false)}
            >
              {resetPassword_ ? "Close" : "Cancel"}
            </Button>
            {!resetPassword_ && (
              <Button
                onClick={handleConfirmReset}
                disabled={resetting}
              >
                {resetting && (
                  <span className="mr-2 h-4 w-4 animate-spin inline-block border-2 border-white border-t-transparent rounded-full" />
                )}
                Generate New Password
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
