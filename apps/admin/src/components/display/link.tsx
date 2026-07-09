import { ComponentProps } from "react";
import { EmptyValue } from "@/components/display/empty-value";
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
    <EmptyValue />
  );
}
