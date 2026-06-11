import { useEffect, useRef, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const isFirstRender = useRef(true);
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
