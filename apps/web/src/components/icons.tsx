import Image from "next/image";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Logo({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-3 text-foreground sm:gap-4", className)} {...props}>
      <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 sm:h-14 sm:w-14">
        <Image
          src="/images/logo1.png"
          alt="Tareeq Al Haqq crest"
          width={56}
          height={56}
          className="h-full w-full object-contain"
          priority
        />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[0.6rem] uppercase tracking-[0.45em] text-primary/70 sm:text-xs">Tareeq</span>
        <span className="text-lg font-headline uppercase text-foreground sm:text-2xl">Al Haqq</span>
      </div>
    </div>
  );
}
