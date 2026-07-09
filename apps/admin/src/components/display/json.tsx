import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { ComponentProps, useState } from "react";
import { darkStyles, JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

export interface JsonProps
  extends Omit<ComponentProps<typeof JsonView>, "data"> {
  data?: unknown;
}

export function Json({ data, ...props }: JsonProps) {
  const [levelToExpand, setLevelToExpand] = useState(5);

  return (
    <div className="relative">
      <JsonView
        clickToExpandNode={true}
        data={data ?? {}}
        shouldExpandNode={(level, _value) => level <= levelToExpand}
        style={{
          ...darkStyles,
          container: "rounded bg-base-200 text-base-content py-2",
        }}
        {...props}
      />
      <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-base-100">
        <button
          className="btn btn-xs btn-square btn-ghost"
          onClick={() => setLevelToExpand((prev) => Math.max(prev - 1, 1))}
          type="button"
        >
          <MinusIcon />
        </button>
        <span className="font-bold">{levelToExpand}</span>
        <button
          className="btn btn-xs btn-square btn-ghost"
          onClick={() => setLevelToExpand((prev) => prev + 1)}
          type="button"
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
}
