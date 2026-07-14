import { cn } from "@/lib/cn";

export interface AuthBrandPanelProps {
  className?: string;
}

export function AuthBrandPanel({ className }: AuthBrandPanelProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden bg-linear-to-b from-primary to-secondary",
        className
      )}
    >
      <div className="absolute -top-16 -right-10 size-48 rounded-full border border-white/25" />
      <div className="absolute top-10 left-6 size-24 rounded-full bg-white/10" />
      <div className="absolute top-1/3 right-10 size-16 rotate-45 border-2 border-white/30" />
      <div className="absolute right-1/4 bottom-20 size-28 rounded-full border border-white/20" />
      <div className="absolute -bottom-8 -left-8 size-36 rotate-12 bg-white/10" />
      <div className="absolute bottom-14 left-14 size-2.5 rounded-full bg-white/50" />
      <div className="absolute top-1/2 left-1/3 size-2 rounded-full bg-white/40" />
    </div>
  );
}
