import { useRef } from "react";

function isDeepEqual(current: unknown, next: unknown): boolean {
  return JSON.stringify(current) === JSON.stringify(next);
}

export function useStableValue<Value>(value: Value): Value {
  const stableRef = useRef(value);
  if (!isDeepEqual(stableRef.current, value)) {
    stableRef.current = value;
  }
  return stableRef.current;
}
