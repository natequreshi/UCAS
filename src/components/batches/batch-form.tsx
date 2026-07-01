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
import { createBatch, updateBatch } from "@/app/(dashboard)/batches/actions";
import type { Batch } from "@prisma/client";

const schema = z.object({
  prefix: z
    .string()
    .min(2, "Prefix must be at least 2 characters")
    .max(5, "Prefix must be at most 5 characters"),
  label: z.string().min(2, "Label must be at least 2 characters"),
  year: z.coerce.number().int().min(2015).max(2040),
  semesterType: z.enum(["FALL", "SPRING"]),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

type BatchWithCount = Batch & { _count: { students: number } };

interface BatchFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  batch?: BatchWithCount | null;
  onSuccess: () => void;
}

export function BatchForm({
  open,
  onOpenChange,
  batch,
  onSuccess,
}: BatchFormProps) {
  const isEdit = !!batch;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      prefix: "",
      label: "",
      year: new Date().getFullYear(),
      semesterType: "FALL",
      isActive: true,
    },
  });

  const semesterType = watch("semesterType");
  const isActive = watch("isActive");

  useEffect(() => {
    if (open) {
      if (batch) {
        reset({
          prefix: batch.prefix,
          label: batch.label,
          year: batch.year,
          semesterType: batch.semesterType as "FALL" | "SPRING",
          isActive: batch.isActive,
        });
      } else {
        reset({
          prefix: "",
          label: "",
          year: new Date().getFullYear(),
          semesterType: "FALL",
          isActive: true,
        });
      }
    }
  }, [open, batch, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      prefix: values.prefix.toUpperCase(),
      label: values.label,
      year: values.year,
      semesterType: values.semesterType,
    };

    const result = isEdit
      ? await updateBatch(batch.id, { ...payload, isActive: values.isActive })
      : await createBatch(payload);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success(isEdit ? "Batch updated." : "Batch created.");
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Batch" : "Add Batch"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="batch-prefix">Prefix *</Label>
              <Input
                id="batch-prefix"
                placeholder="e.g. F22"
                maxLength={5}
                {...register("prefix")}
                onChange={(e) =>
                  setValue("prefix", e.target.value.toUpperCase(), {
                    shouldValidate: true,
                  })
                }
              />
              {errors.prefix && (
                <p className="text-xs text-destructive">
                  {errors.prefix.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="batch-year">Year *</Label>
              <Input
                id="batch-year"
                type="number"
                min={2015}
                max={2040}
                {...register("year")}
              />
              {errors.year && (
                <p className="text-xs text-destructive">{errors.year.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="batch-label">Label *</Label>
            <Input
              id="batch-label"
              placeholder="e.g. Fall 2022"
              {...register("label")}
            />
            {errors.label && (
              <p className="text-xs text-destructive">{errors.label.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Semester Type *</Label>
            <Select
              value={semesterType}
              onValueChange={(v) =>
                setValue("semesterType", v as "FALL" | "SPRING", {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FALL">Fall</SelectItem>
                <SelectItem value="SPRING">Spring</SelectItem>
              </SelectContent>
            </Select>
            {errors.semesterType && (
              <p className="text-xs text-destructive">
                {errors.semesterType.message}
              </p>
            )}
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive batches won&apos;t appear in selection lists
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
