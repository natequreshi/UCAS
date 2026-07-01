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
import { createRoom, updateRoom } from "@/app/(dashboard)/rooms/actions";
import type { Building, Room } from "@prisma/client";

const ROOM_TYPES = [
  { value: "LECTURE_HALL", label: "Lecture Hall" },
  { value: "LAB_COMPUTER", label: "Computer Lab" },
  { value: "LAB_PHYSICS", label: "Physics Lab" },
  { value: "LAB_CHEMISTRY", label: "Chemistry Lab" },
  { value: "LAB_ELECTRONICS", label: "Electronics Lab" },
  { value: "SEMINAR_ROOM", label: "Seminar Room" },
  { value: "AUDITORIUM", label: "Auditorium" },
] as const;

const schema = z.object({
  buildingId: z.string().uuid("Select a building"),
  code: z.string().min(1, "Code is required").max(20),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1").max(1000),
  roomType: z.enum([
    "LECTURE_HALL",
    "LAB_COMPUTER",
    "LAB_PHYSICS",
    "LAB_CHEMISTRY",
    "LAB_ELECTRONICS",
    "SEMINAR_ROOM",
    "AUDITORIUM",
  ]),
  hasProjector: z.boolean().default(false),
  hasAC: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

interface RoomFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  room?: (Room & { building: Building }) | null;
  buildings: (Building & { _count: { rooms: number } })[];
  onSuccess: () => void;
}

export function RoomForm({
  open,
  onOpenChange,
  room,
  buildings,
  onSuccess,
}: RoomFormProps) {
  const isEdit = !!room;

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
      buildingId: "",
      code: "",
      name: "",
      capacity: 40,
      roomType: "LECTURE_HALL",
      hasProjector: false,
      hasAC: false,
      isActive: true,
    },
  });

  const buildingId = watch("buildingId");
  const roomType = watch("roomType");
  const hasProjector = watch("hasProjector");
  const hasAC = watch("hasAC");
  const isActive = watch("isActive");

  useEffect(() => {
    if (open) {
      if (room) {
        reset({
          buildingId: room.buildingId,
          code: room.code,
          name: room.name,
          capacity: room.capacity,
          roomType: room.roomType,
          hasProjector: room.hasProjector,
          hasAC: room.hasAC,
          isActive: room.isActive,
        });
      } else {
        reset({
          buildingId: "",
          code: "",
          name: "",
          capacity: 40,
          roomType: "LECTURE_HALL",
          hasProjector: false,
          hasAC: false,
          isActive: true,
        });
      }
    }
  }, [open, room, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      buildingId: values.buildingId,
      code: values.code.toUpperCase(),
      name: values.name,
      capacity: values.capacity,
      roomType: values.roomType,
      hasProjector: values.hasProjector,
      hasAC: values.hasAC,
    };

    const result = isEdit
      ? await updateRoom(room.id, { ...payload, isActive: values.isActive })
      : await createRoom(payload);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success(isEdit ? "Room updated." : "Room created.");
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Room" : "Add Room"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Building *</Label>
            <Select
              value={buildingId}
              onValueChange={(v) =>
                setValue("buildingId", v, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select building" />
              </SelectTrigger>
              <SelectContent>
                {buildings
                  .filter((b) => b.isActive)
                  .map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.buildingId && (
              <p className="text-xs text-destructive">
                {errors.buildingId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="r-code">Code *</Label>
              <Input
                id="r-code"
                placeholder="e.g. CS-101"
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
              <Label htmlFor="r-capacity">Capacity *</Label>
              <Input
                id="r-capacity"
                type="number"
                min={1}
                max={1000}
                {...register("capacity")}
              />
              {errors.capacity && (
                <p className="text-xs text-destructive">
                  {errors.capacity.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="r-name">Name *</Label>
            <Input
              id="r-name"
              placeholder="e.g. Room 101"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Room Type *</Label>
            <Select
              value={roomType}
              onValueChange={(v) =>
                setValue("roomType", v as FormValues["roomType"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomType && (
              <p className="text-xs text-destructive">
                {errors.roomType.message}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex items-center justify-between flex-1 rounded-lg border p-3">
              <p className="text-sm font-medium">Has Projector</p>
              <Switch
                checked={hasProjector}
                onCheckedChange={(v) => setValue("hasProjector", v)}
              />
            </div>
            <div className="flex items-center justify-between flex-1 rounded-lg border p-3">
              <p className="text-sm font-medium">Has AC</p>
              <Switch
                checked={hasAC}
                onCheckedChange={(v) => setValue("hasAC", v)}
              />
            </div>
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive rooms won&apos;t be available for scheduling
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
