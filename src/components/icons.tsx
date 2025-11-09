import Image from "next/image";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Logo({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-4 text-foreground", className)} {...props}>
      <span className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-primary/10">
        <Image
          src="/images/logo-mark.svg"
          alt="Tareeq Al Haqq crest"
          width={56}
          height={56}
          className="h-full w-full object-contain"
          priority
        />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-xs uppercase tracking-[0.45em] text-primary/70">Tareeq</span>
        <span className="text-2xl font-headline uppercase text-foreground">Al Haqq</span>
      </div>
    </div>
  );
}
