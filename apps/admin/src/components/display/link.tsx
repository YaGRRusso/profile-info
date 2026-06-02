import { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface LinkProps extends Omit<ComponentProps<"a">, "href"> {
  href?: string | null;
}

export function Link({ href, className, ...props }: LinkProps) {
  return href ? (
    <a
      className={cn("link", className)}
      href={href}
      rel="noreferrer"
      target="_blank"
      {...props}
    >
      {href}
    </a>
  ) : (
    <span className={cn("text-sm opacity-sm", className)}>empty</span>
  );
}
