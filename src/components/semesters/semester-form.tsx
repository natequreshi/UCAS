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
import {
  createSemester,
  updateSemester,
} from "@/app/(dashboard)/semesters/actions";
import type { AcademicSemester } from "@prisma/client";

const schema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  semesterType: z.enum(["FALL", "SPRING", "SUMMER"]),
  year: z.coerce.number().int().min(2020).max(2040),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isSummer: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

function toDateInputValue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().substring(0, 10);
}

interface SemesterFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  semester?: AcademicSemester | null;
  onSuccess: () => void;
}

export function SemesterForm({
  open,
  onOpenChange,
  semester,
  onSuccess,
}: SemesterFormProps) {
  const isEdit = !!semester;

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
      code: "",
      name: "",
      semesterType: "FALL",
      year: new Date().getFullYear(),
      startDate: "",
      endDate: "",
      isSummer: false,
      isActive: true,
    },
  });

  const semesterType = watch("semesterType");
  const isSummer = watch("isSummer");
  const isActive = watch("isActive");

  useEffect(() => {
    if (open) {
      if (semester) {
        reset({
          code: semester.code,
          name: semester.name,
          semesterType: semester.semesterType,
          year: semester.year,
          startDate: toDateInputValue(semester.startDate),
          endDate: toDateInputValue(semester.endDate),
          isSummer: semester.isSummer,
          isActive: semester.isActive,
        });
      } else {
        reset({
          code: "",
          name: "",
          semesterType: "FALL",
          year: new Date().getFullYear(),
          startDate: "",
          endDate: "",
          isSummer: false,
          isActive: true,
        });
      }
    }
  }, [open, semester, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      code: values.code,
      name: values.name,
      semesterType: values.semesterType,
      year: values.year,
      startDate: values.startDate,
      endDate: values.endDate,
      isSummer: values.isSummer,
    };

    const result = isEdit
      ? await updateSemester(semester.id, {
          ...payload,
          isActive: values.isActive,
        })
      : await createSemester(payload);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success(isEdit ? "Semester updated." : "Semester created.");
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Semester" : "Add Semester"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sem-code">Code *</Label>
              <Input
                id="sem-code"
                placeholder="e.g. F2024"
                {...register("code")}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sem-year">Year *</Label>
              <Input
                id="sem-year"
                type="number"
                min={2020}
                max={2040}
                {...register("year")}
              />
              {errors.year && (
                <p className="text-xs text-destructive">{errors.year.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sem-name">Name *</Label>
            <Input
              id="sem-name"
              placeholder="e.g. Fall 2024"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Semester Type *</Label>
            <Select
              value={semesterType}
              onValueChange={(v) =>
                setValue("semesterType", v as "FALL" | "SPRING" | "SUMMER", {
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
                <SelectItem value="SUMMER">Summer</SelectItem>
              </SelectContent>
            </Select>
            {errors.semesterType && (
              <p className="text-xs text-destructive">
                {errors.semesterType.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sem-start">Start Date *</Label>
              <Input id="sem-start" type="date" {...register("startDate")} />
              {errors.startDate && (
                <p className="text-xs text-destructive">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sem-end">End Date *</Label>
              <Input id="sem-end" type="date" {...register("endDate")} />
              {errors.endDate && (
                <p className="text-xs text-destructive">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center justify-between flex-1 rounded-lg border p-3">
              <p className="text-sm font-medium">Is Summer</p>
              <Switch
                checked={isSummer}
                onCheckedChange={(v) => setValue("isSummer", v)}
              />
            </div>
            {isEdit && (
              <div className="flex items-center justify-between flex-1 rounded-lg border p-3">
                <p className="text-sm font-medium">Active</p>
                <Switch
                  checked={isActive}
                  onCheckedChange={(v) => setValue("isActive", v)}
                />
              </div>
            )}
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
              {isEdit ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
