import { WarningCircleIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import {
  type SystemMessageVariant,
  useSystemMessagesStore,
} from "@/stores/system-messages";

const ALERT_VARIANT_CLASS: Record<SystemMessageVariant, string> = {
  error: "alert-error",
  info: "alert-info",
  success: "alert-success",
  warning: "alert-warning",
};

const BUTTON_VARIANT_CLASS: Record<SystemMessageVariant, string> = {
  error: "btn-error",
  info: "btn-info",
  success: "btn-success",
  warning: "btn-warning",
};

export function SystemMessages() {
  const messages = useSystemMessagesStore((state) => state.messages);
  const clearMessage = useSystemMessagesStore((state) => state.clearMessage);
  const items = Object.values(messages);

  if (!items.length) return null;

  return (
    <div className="mx-auto flex items-stretch gap-2 overflow-auto">
      {items.map((message) => (
        <div
          className={cn(
            "alert alert-soft h-12 flex-1 animate-system-message gap-2",
            ALERT_VARIANT_CLASS[message.variant ?? "info"]
          )}
          key={message.id}
          role="alert"
        >
          <WarningCircleIcon />
          <div className="flex flex-col whitespace-nowrap">
            <span>{message.title}</span>
          </div>
          <button
            className={cn(
              "btn btn-ghost btn-xs btn-circle",
              BUTTON_VARIANT_CLASS[message.variant ?? "info"]
            )}
            onClick={() => {
              clearMessage(message.id);
            }}
            type="button"
          >
            <XIcon />
          </button>
        </div>
      ))}
    </div>
  );
}
