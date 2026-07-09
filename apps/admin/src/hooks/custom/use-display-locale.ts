import { useDisplayLocaleStore } from "@/stores/display-locale";

export function useDisplayLocale() {
  return useDisplayLocaleStore((state) => state.locale);
}
