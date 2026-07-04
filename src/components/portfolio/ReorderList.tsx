"use client";

import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReorderRowProps {
  label: string;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ReorderRow({
  label,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  className,
}: ReorderRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5",
        className
      )}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      <span className="flex-1 truncate text-sm font-medium">{label}</span>
      <div className="flex shrink-0 gap-0.5">
        {onEdit && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onMoveUp}
          disabled={index === 0}
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onMoveDown}
          disabled={index === total - 1}
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

interface ReorderListProps {
  items: { id: string; label: string }[];
  onReorder: (ids: string[]) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  addLabel?: string;
  emptyMessage?: string;
}

export function ReorderList({
  items,
  onReorder,
  onEdit,
  onDelete,
  onAdd,
  addLabel = "Add item",
  emptyMessage = "Nothing here yet.",
}: ReorderListProps) {
  const move = (index: number, direction: "up" | "down") => {
    const ids = items.map((i) => i.id);
    const swap = direction === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= ids.length) return;
    [ids[index], ids[swap]] = [ids[swap], ids[index]];
    onReorder(ids);
  };

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">{emptyMessage}</p>
      ) : (
        items.map((item, index) => (
          <ReorderRow
            key={item.id}
            label={item.label}
            index={index}
            total={items.length}
            onMoveUp={() => move(index, "up")}
            onMoveDown={() => move(index, "down")}
            onEdit={onEdit ? () => onEdit(item.id) : undefined}
            onDelete={onDelete ? () => onDelete(item.id) : undefined}
          />
        ))
      )}
      {onAdd && (
        <Button variant="outline" size="sm" className="w-full gap-1 rounded-xl" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
