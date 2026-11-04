import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface SuggestionsProps
  extends Omit<ComponentProps<"div">, "onSelect"> {
  items: string[];
  onSelect: (item: string) => void;
  value: string;
}

export function Suggestions({
  children,
  className,
  items,
  onSelect,
  value,
  ...props
}: SuggestionsProps) {
  const filtered = items.filter(
    (item) =>
      value &&
      item !== value &&
      item.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className={cn("dropdown w-full", className)} {...props}>
      {children}
      {filtered.length > 0 && (
        <ul
          className="dropdown-content menu z-30 w-full rounded-box bg-base-200"
          tabIndex={-1}
        >
          {filtered.map((item) => (
            <li key={item}>
              <button onClick={() => onSelect(item)} type="button">
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
