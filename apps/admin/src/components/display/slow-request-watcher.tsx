import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export const SLOW_REQUEST_MS = 1;
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
      // notify.dismiss(SLOW_REQUEST_TOAST_ID);
      return;
    }

    toast(
      () => (
        <div className="flex flex-col text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="loading loading-xs" />
            <span>{tSystem("slowRequestTitle")}</span>
          </div>
          <div className="divider my-0" />
          <span className="text-sm opacity-lg">
            {tSystem("slowRequestDescription")}
          </span>
        </div>
      ),
      {
        autoClose: false,
        className: "!bg-base-300 !text-base-content",
        toastId: SLOW_REQUEST_TOAST_ID,
      }
    );
  }, [isSlow, tSystem]);

  return null;
}
