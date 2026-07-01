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
import { createProgram, updateProgram } from "@/app/(dashboard)/programs/actions";
import type { Department, Program } from "@prisma/client";

const schema = z.object({
  departmentId: z.string().uuid("Select a department"),
  code: z.string().min(2, "Code must be at least 2 characters").max(20),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  level: z.enum(["BS", "MS", "PHD"], { required_error: "Select a level" }),
  durationYears: z.coerce.number().int().min(1).max(6),
  totalCredits: z.coerce.number().int().min(30).max(200),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

interface ProgramFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  program?: (Program & { department: Department }) | null;
  departments: Department[];
  onSuccess: () => void;
}

export function ProgramForm({
  open,
  onOpenChange,
  program,
  departments,
  onSuccess,
}: ProgramFormProps) {
  const isEdit = !!program;

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
      departmentId: "",
      code: "",
      name: "",
      level: "BS",
      durationYears: 4,
      totalCredits: 130,
      isActive: true,
    },
  });

  const isActive = watch("isActive");
  const levelValue = watch("level");
  const departmentValue = watch("departmentId");

  useEffect(() => {
    if (open) {
      if (program) {
        reset({
          departmentId: program.departmentId,
          code: program.code,
          name: program.name,
          level: program.level,
          durationYears: program.durationYears,
          totalCredits: program.totalCredits,
          isActive: program.isActive,
        });
      } else {
        reset({
          departmentId: "",
          code: "",
          name: "",
          level: "BS",
          durationYears: 4,
          totalCredits: 130,
          isActive: true,
        });
      }
    }
  }, [open, program, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      departmentId: values.departmentId,
      code: values.code.toUpperCase(),
      name: values.name,
      level: values.level,
      durationYears: values.durationYears,
      totalCredits: values.totalCredits,
    };

    const result = isEdit
      ? await updateProgram(program.id, { ...payload, isActive: values.isActive })
      : await createProgram(payload);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success(isEdit ? "Program updated." : "Program created.");
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Program" : "Add Program"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Department *</Label>
            <Select
              value={departmentValue}
              onValueChange={(v) =>
                setValue("departmentId", v, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.departmentId && (
              <p className="text-xs text-destructive">
                {errors.departmentId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prog-code">Code *</Label>
              <Input
                id="prog-code"
                placeholder="e.g. BSCS"
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
              <Label>Level *</Label>
              <Select
                value={levelValue}
                onValueChange={(v) =>
                  setValue("level", v as "BS" | "MS" | "PHD", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BS">BS (Bachelor&apos;s)</SelectItem>
                  <SelectItem value="MS">MS (Master&apos;s)</SelectItem>
                  <SelectItem value="PHD">PhD (Doctorate)</SelectItem>
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-xs text-destructive">{errors.level.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prog-name">Program Name *</Label>
            <Input
              id="prog-name"
              placeholder="e.g. BS Computer Science"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration (Years) *</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={6}
                {...register("durationYears")}
              />
              {errors.durationYears && (
                <p className="text-xs text-destructive">
                  {errors.durationYears.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="credits">Total Credits *</Label>
              <Input
                id="credits"
                type="number"
                min={30}
                max={200}
                {...register("totalCredits")}
              />
              {errors.totalCredits && (
                <p className="text-xs text-destructive">
                  {errors.totalCredits.message}
                </p>
              )}
            </div>
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive programs won&apos;t appear in selection lists
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
