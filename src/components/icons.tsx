import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Logo({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-4 text-foreground", className)} {...props}>
      <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent shadow-lg shadow-black/30">
        <span className="absolute inset-[2px] rounded-full bg-gradient-to-br from-white/10 via-transparent to-black/40" />
        <span className="relative text-sm font-headline uppercase tracking-[0.6em] text-primary-foreground">TAH</span>
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-xs uppercase tracking-[0.45em] text-primary/70">Tareeq</span>
        <span className="text-2xl font-headline uppercase text-foreground">Al Haqq</span>
      </div>
    </div>
  );
}
