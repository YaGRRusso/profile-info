import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const SLOW_REQUEST_MS = 5000;
const SLOW_REQUEST_TOAST_ID = "slow-request";

export function SlowRequestWatcher() {
  const { t: tSystem } = useTranslation("system");
  const isPending = useIsFetching() + useIsMutating() > 0;
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setIsSlow(false);
      return;
    }

    const timeoutId = setTimeout(() => setIsSlow(true), SLOW_REQUEST_MS);
    return () => clearTimeout(timeoutId);
  }, [isPending]);

  useEffect(() => {
    if (!isSlow) {
      toast.dismiss(SLOW_REQUEST_TOAST_ID);
      return;
    }

    toast.loading(tSystem("slowRequestTitle"), {
      description: tSystem("slowRequestDescription"),
      duration: Number.POSITIVE_INFINITY,
      id: SLOW_REQUEST_TOAST_ID,
    });
  }, [isSlow, tSystem]);

  return null;
}
