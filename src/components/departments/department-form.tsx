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
import { createDepartment, updateDepartment } from "@/app/(dashboard)/departments/actions";
import type { Department } from "@prisma/client";

const schema = z.object({
  code: z.string().min(1, "Code is required").max(10),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  abbreviation: z.string().max(10).optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

interface DepartmentFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  department?: Department | null;
  onSuccess: () => void;
}

export function DepartmentForm({
  open,
  onOpenChange,
  department,
  onSuccess,
}: DepartmentFormProps) {
  const isEdit = !!department;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", name: "", abbreviation: "", isActive: true },
  });

  const isActive = watch("isActive");

  useEffect(() => {
    if (open) {
      if (department) {
        reset({
          code: department.code,
          name: department.name,
          abbreviation: department.abbreviation ?? "",
          isActive: department.isActive,
        });
      } else {
        reset({ code: "", name: "", abbreviation: "", isActive: true });
      }
    }
  }, [open, department, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      code: values.code.toUpperCase(),
      name: values.name,
      abbreviation: values.abbreviation || undefined,
    };

    const result = isEdit
      ? await updateDepartment(department.id, { ...payload, isActive: values.isActive })
      : await createDepartment(payload);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success(isEdit ? "Department updated." : "Department created.");
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Department" : "Add Department"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              placeholder="e.g. CS"
              {...register("code")}
              onChange={(e) =>
                setValue("code", e.target.value.toUpperCase(), {
                  shouldValidate: true,
                })
              }
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Computer Science"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="abbreviation">Abbreviation (optional)</Label>
            <Input
              id="abbreviation"
              placeholder="e.g. CS Dept"
              {...register("abbreviation")}
            />
            {errors.abbreviation && (
              <p className="text-xs text-destructive">
                {errors.abbreviation.message}
              </p>
            )}
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive departments are hidden from selection lists
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(v) => setValue("isActive", v)}
              />
            </div>
          )}

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
              {isEdit ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
