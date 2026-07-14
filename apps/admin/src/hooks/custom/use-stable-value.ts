import { isEqual } from "lodash";
import { useRef } from "react";

export function useStableValue<Value>(value: Value): Value {
  const stableRef = useRef(value);
  if (!isEqual(stableRef.current, value)) {
    stableRef.current = value;
  }
  return stableRef.current;
}
