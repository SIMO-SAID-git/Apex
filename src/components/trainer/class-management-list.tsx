"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Send, CalendarX } from "lucide-react";
import { useMyTaughtClasses } from "@/hooks/queries/use-my-taught-classes";
import { useCancelClass, usePublishClass } from "@/hooks/mutations/use-trainer-class-mutations";
import { ClassFormDialog } from "@/components/trainer/class-form-dialog";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClassSlotSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { formatFriendlyDate, formatTimeRange } from "@/lib/utils/dates";
import type { FitnessClass } from "@/types/class";

export function ClassManagementList() {
  const { data: classes, isLoading, isError, refetch } = useMyTaughtClasses();
  const cancelClass = useCancelClass();
  const publishClass = usePublishClass();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<FitnessClass | undefined>(undefined);

  function openCreate() {
    setEditingClass(undefined);
    setIsFormOpen(true);
  }

  function openEdit(fitnessClass: FitnessClass) {
    setEditingClass(fitnessClass);
    setIsFormOpen(true);
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <ClassSlotSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState message="We couldn't load your classes." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New class
        </Button>
      </div>

      {!classes || classes.length === 0 ? (
        <EmptyState
          title="You haven't created any classes yet"
          description="Create your first class, fill in the details, then publish it so members can find and book it."
          icon={CalendarX}
          actionLabel="Create a class"
          onAction={openCreate}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {classes.map((fitnessClass) => (
            <GlassCard key={fitnessClass.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-white">{fitnessClass.title}</h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    {formatFriendlyDate(fitnessClass.date)} · {formatTimeRange(fitnessClass.startTime, fitnessClass.endTime)}
                  </p>
                </div>
                <Badge tone={fitnessClass.isPublished ? "success" : "neutral"}>
                  {fitnessClass.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>

              <p className="text-sm text-white/60 line-clamp-2">{fitnessClass.description}</p>

              <div className="flex items-center gap-2 text-xs text-white/50">
                <span>{fitnessClass.bookedCount}/{fitnessClass.capacity} booked</span>
                <span aria-hidden>·</span>
                <span className="capitalize">{fitnessClass.category}</span>
                <span aria-hidden>·</span>
                <span className="capitalize">{fitnessClass.intensity}</span>
              </div>

              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(fitnessClass)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                {!fitnessClass.isPublished ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => publishClass.mutate(fitnessClass.id)}
                    isLoading={publishClass.isPending && publishClass.variables === fitnessClass.id}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Publish
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-status-peak hover:bg-status-peak/10"
                  onClick={() => cancelClass.mutate(fitnessClass.id)}
                  isLoading={cancelClass.isPending && cancelClass.variables === fitnessClass.id}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <ClassFormDialog isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} editingClass={editingClass} />
    </div>
  );
}
