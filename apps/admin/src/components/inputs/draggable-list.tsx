import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { type ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface DraggableListProps
  extends Omit<ComponentProps<"ul">, "onChange" | "value"> {
  onChange?: (value: string[]) => void;
  options: { disabled?: boolean; label: string; value: string }[];
  showRemove?: boolean;
  value?: string[];
}

interface DraggableListItemProps {
  disabled?: boolean;
  index: number;
  label: string;
  onRemove?: () => void;
  value: string;
}

function DraggableListItem({
  disabled,
  index,
  label,
  onRemove,
  value,
}: DraggableListItemProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: value,
    index,
  });

  return (
    <li
      className={cn(
        "list-row items-center rounded-none px-0 [--radius-box:0]",
        isDragging && "opacity-50"
      )}
      ref={ref}
    >
      <button
        aria-label="Reorder"
        className="cursor-grab touch-none active:cursor-grabbing"
        ref={handleRef}
        type="button"
      >
        <ListIcon className="opacity-30" />
      </button>
      <div className="font-thin tabular-nums opacity-30">
        {(index + 1).toString().padStart(2, "0")}
      </div>
      <div className={cn("list-col-grow", disabled && "text-error")}>
        {label}
      </div>
      {onRemove && (
        <button
          className="btn btn-xs btn-ghost btn-error btn-square"
          onClick={onRemove}
          type="button"
        >
          <XIcon />
        </button>
      )}
    </li>
  );
}

export function DraggableList({
  className,
  value = [],
  onChange,
  options,
  showRemove = true,
  ...props
}: DraggableListProps) {
  const orderedOptions = value.map((itemValue) => {
    const option = options.find((candidate) => candidate.value === itemValue);
    return option ?? { label: itemValue, value: itemValue };
  });

  if (!orderedOptions.length) return null;

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled || !onChange) return;

        const { source } = event.operation;
        if (!isSortable(source)) return;

        const { initialIndex, index } = source;
        if (initialIndex === index) return;

        const next = [...value];
        const [removed] = next.splice(initialIndex, 1);
        next.splice(index, 0, removed);
        onChange(next);
      }}
    >
      <ul className={cn("list", className)} {...props}>
        {orderedOptions.map((option, index) => (
          <DraggableListItem
            disabled={option.disabled}
            index={index}
            key={option.value}
            label={option.label}
            onRemove={
              showRemove && onChange
                ? () => onChange(value.filter((id) => id !== option.value))
                : undefined
            }
            value={option.value}
          />
        ))}
      </ul>
    </DragDropProvider>
  );
}
