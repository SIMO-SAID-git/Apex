"use client";

import { useEffect, useId, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEquipment } from "@/hooks/queries/use-equipment";
import { useCreateClass, useUpdateClass } from "@/hooks/mutations/use-trainer-class-mutations";
import { createClassSchema } from "@/lib/validations/class-schema";
import type { FitnessClass, ClassCategory, Intensity } from "@/types/class";

const CATEGORY_OPTIONS: { value: ClassCategory; label: string }[] = [
  { value: "strength", label: "Strength" },
  { value: "hiit", label: "HIIT" },
  { value: "cardio", label: "Cardio" },
  { value: "zen", label: "Zen" },
];

const INTENSITY_OPTIONS: { value: Intensity; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

interface ClassFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingClass?: FitnessClass;
}

export function ClassFormDialog({ isOpen, onClose, editingClass }: ClassFormDialogProps) {
  const { data: equipment } = useEquipment();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ClassCategory>("strength");
  const [intensity, setIntensity] = useState<Intensity>("medium");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [capacity, setCapacity] = useState(12);
  const [zoneId, setZoneId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const titleId = useId();
  const descriptionId = useId();
  const dateId = useId();
  const timeId = useId();
  const durationId = useId();
  const capacityId = useId();
  const zoneSelectId = useId();

  const isPending = createClass.isPending || updateClass.isPending;

  useEffect(() => {
    if (!isOpen) return;
    if (editingClass) {
      setTitle(editingClass.title);
      setDescription(editingClass.description);
      setCategory(editingClass.category);
      setIntensity(editingClass.intensity);
      setDate(editingClass.date);
      setStartTime(editingClass.startTime);
      setDurationMinutes(editingClass.durationMinutes);
      setCapacity(editingClass.capacity);
      setZoneId(editingClass.zoneId);
    } else {
      setTitle("");
      setDescription("");
      setCategory("strength");
      setIntensity("medium");
      setDate("");
      setStartTime("");
      setDurationMinutes(45);
      setCapacity(12);
      setZoneId(equipment?.zones[0]?.id ?? "");
    }
    setError(null);
  }, [isOpen, editingClass, equipment]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = createClassSchema.safeParse({
      title,
      description,
      category,
      intensity,
      date,
      startTime,
      durationMinutes,
      capacity,
      zoneId,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form for errors.");
      return;
    }

    if (editingClass) {
      updateClass.mutate(
        { classId: editingClass.id, input: parsed.data },
        { onSuccess: onClose, onError: () => setError("Unable to save changes right now.") }
      );
    } else {
      createClass.mutate(parsed.data, { onSuccess: onClose, onError: () => setError("Unable to create this class right now.") });
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingClass ? "Edit class" : "New class"} className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div>
          <Label htmlFor={titleId}>Title</Label>
          <Input id={titleId} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sunrise Strength" />
        </div>

        <div>
          <Label htmlFor={descriptionId}>Description</Label>
          <textarea
            id={descriptionId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-white/20"
            placeholder="What should members expect from this session?"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Class type</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ClassCategory)}
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Difficulty</Label>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value as Intensity)}
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {INTENSITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor={dateId}>Date</Label>
            <Input id={dateId} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor={timeId}>Start time</Label>
            <Input id={timeId} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor={durationId}>Duration (min)</Label>
            <Input
              id={durationId}
              type="number"
              min={15}
              max={180}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor={capacityId}>Capacity</Label>
            <Input id={capacityId} type="number" min={1} max={60} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
          </div>
        </div>

        <div>
          <Label htmlFor={zoneSelectId}>Location / Zone</Label>
          <select
            id={zoneSelectId}
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            {(equipment?.zones ?? []).map((zone) => (
              <option key={zone.id} value={zone.id} className="bg-surface-900">
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        <FieldError id="class-form-error" message={error ?? undefined} />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" isLoading={isPending}>
            {editingClass ? "Save changes" : "Create as draft"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
