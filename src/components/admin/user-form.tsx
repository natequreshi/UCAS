"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser, updateUser } from "@/app/(dashboard)/admin/actions";
import { ROLE_LABELS } from "@/lib/constants";
import type { User } from "@prisma/client";

const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "SCHEDULE_MANAGER",
  "DEPARTMENT_CHAIR",
  "TEACHER",
  "STUDENT",
  "VIEWER",
] as const;

const createSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "SCHEDULE_MANAGER",
    "DEPARTMENT_CHAIR",
    "TEACHER",
    "STUDENT",
    "VIEWER",
  ]),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isActive: z.boolean().default(true),
  mustChangePwd: z.boolean().default(true),
});

const updateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "SCHEDULE_MANAGER",
    "DEPARTMENT_CHAIR",
    "TEACHER",
    "STUDENT",
    "VIEWER",
  ]),
  isActive: z.boolean().default(true),
  mustChangePwd: z.boolean().default(false),
});

type CreateValues = z.infer<typeof createSchema>;
type UpdateValues = z.infer<typeof updateSchema>;

interface UserFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user?: User | null;
  onSuccess: () => void;
}

export function UserForm({ open, onOpenChange, user, onSuccess }: UserFormProps) {
  const isEdit = !!user;

  // Use the right schema based on create vs edit
  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      email: "",
      name: "",
      role: "VIEWER",
      password: "",
      isActive: true,
      mustChangePwd: true,
    },
  });

  const updateForm = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: "",
      role: "VIEWER",
      isActive: true,
      mustChangePwd: false,
    },
  });

  const form = isEdit ? updateForm : createForm;
  const { handleSubmit, reset, setValue, watch, formState } = form;
  const { errors, isSubmitting } = formState;

  const roleValue = watch("role" as any);
  const isActive = watch("isActive" as any);
  const mustChangePwd = watch("mustChangePwd" as any);

  useEffect(() => {
    if (open) {
      if (user) {
        updateForm.reset({
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          mustChangePwd: user.mustChangePwd,
        });
      } else {
        createForm.reset({
          email: "",
          name: "",
          role: "VIEWER",
          password: "",
          isActive: true,
          mustChangePwd: true,
        });
      }
    }
  }, [open, user]);

  const onSubmit = async (values: any) => {
    const result = isEdit
      ? await updateUser(user.id, {
          name: values.name,
          role: values.role,
          isActive: values.isActive,
          mustChangePwd: values.mustChangePwd,
        })
      : await createUser({
          email: values.email,
          name: values.name,
          role: values.role,
          password: values.password,
        });

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success(isEdit ? "User updated." : "User created.");
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="u-name">Name *</Label>
            <Input
              id="u-name"
              placeholder="Full name"
              {...form.register("name")}
            />
            {(errors as any).name && (
              <p className="text-xs text-destructive">
                {(errors as any).name?.message}
              </p>
            )}
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="u-email">Email *</Label>
              <Input
                id="u-email"
                type="email"
                placeholder="user@example.com"
                {...createForm.register("email")}
              />
              {(createForm.formState.errors as any).email && (
                <p className="text-xs text-destructive">
                  {(createForm.formState.errors as any).email?.message}
                </p>
              )}
            </div>
          )}

          {isEdit && (
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled className="bg-muted" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Role *</Label>
            <Select
              value={roleValue}
              onValueChange={(v) =>
                setValue("role" as any, v, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r] ?? r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(errors as any).role && (
              <p className="text-xs text-destructive">
                {(errors as any).role?.message}
              </p>
            )}
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="u-password">Password *</Label>
              <Input
                id="u-password"
                type="password"
                placeholder="Minimum 6 characters"
                {...createForm.register("password")}
              />
              {(createForm.formState.errors as any).password && (
                <p className="text-xs text-destructive">
                  {(createForm.formState.errors as any).password?.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active Account</p>
                <p className="text-xs text-muted-foreground">
                  Inactive accounts cannot log in
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(v) =>
                  setValue("isActive" as any, v)
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Must Change Password</p>
                <p className="text-xs text-muted-foreground">
                  User will be prompted to change password on next login
                </p>
              </div>
              <Switch
                checked={mustChangePwd}
                onCheckedChange={(v) =>
                  setValue("mustChangePwd" as any, v)
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
