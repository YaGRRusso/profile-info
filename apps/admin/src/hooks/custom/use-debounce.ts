import { useEffect, useState } from "react";

export function useDebounce<T>(callback: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(callback);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(callback);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay]);

  return debouncedValue;
}
