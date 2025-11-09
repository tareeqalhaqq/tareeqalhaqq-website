import Image from "next/image";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Logo({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-4", className)} {...props}>
      <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-lg shadow-black/30">
        <Image
          src="https://storage.googleapis.com/static.invertase.io/assets/rahmaniyyah/logo.png"
          alt="Tareeq Al Haqq crest"
          width={48}
          height={48}
          className="h-10 w-10 object-contain"
          priority
        />
      </span>
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-[0.45em] text-primary/70">Tareeq Al Haqq</span>
        <span className="text-2xl font-headline uppercase text-foreground">Rahmaniyyah Path</span>
      </div>
    </div>
  );
}
