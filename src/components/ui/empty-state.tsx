import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, icon: Icon = Inbox, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="glass rounded-2xl p-10 text-center flex flex-col items-center gap-3">
      <Icon className="h-8 w-8 text-white/40" aria-hidden />
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/60 max-w-sm">{description}</p>
      {actionLabel && onAction ? (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
