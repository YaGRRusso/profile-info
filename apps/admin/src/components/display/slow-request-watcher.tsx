import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const SLOW_REQUEST_MS = 1;
const SLOW_REQUEST_TOAST_ID = "slow-request";

function SlowRequestToastDescription({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span>{text}</span>
      {/* No value → DaisyUI indeterminate animation; never implies a finish time */}
      <progress
        aria-label={text}
        className="progress progress-warning w-full"
      />
    </div>
  );
}

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
      // toast.dismiss(SLOW_REQUEST_TOAST_ID);
      return;
    }

    toast.loading(tSystem("slowRequestTitle"), {
      description: (
        <SlowRequestToastDescription text={tSystem("slowRequestDescription")} />
      ),
      duration: Number.POSITIVE_INFINITY,
      id: SLOW_REQUEST_TOAST_ID,
    });
  }, [isSlow, tSystem]);

  return null;
}
