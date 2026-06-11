import { ComponentProps, useState } from "react";
import { cn } from "@/lib/cn";

export interface AvatarProps extends ComponentProps<"div"> {
  avatar?: string | null;
  name?: string | null;
}

export function Avatar({ avatar, name, className, ...props }: AvatarProps) {
  const [isAvatarReady, setIsAvatarReady] = useState(false);

  return (
    <div
      className={cn(
        "avatar rounded-full bg-neutral text-neutral-content transition-all",
        className
      )}
      {...props}
    >
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: ignore */}
      <img
        alt={name ?? "avatar"}
        className={cn("rounded-full", !isAvatarReady && "hidden")}
        height={32}
        onError={() => setIsAvatarReady(false)}
        onLoad={() => setIsAvatarReady(true)}
        src={avatar ?? ""}
        width={32}
      />
      <div
        className={cn(
          "flex items-center justify-center",
          isAvatarReady && "hidden"
        )}
      >
        {name?.charAt(0) ?? "?"}
      </div>
    </div>
  );
}
