"use client";

import Link from "next/link";
import { useState } from "react";
import { navLinks } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ArrowRight } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { clerkAuthAppearance } from "@/lib/clerk-appearance";
import { ReactNode } from "react";

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const SignedOutContent = ({ children }: { children: ReactNode }) =>
    isClerkConfigured ? <SignedOut>{children}</SignedOut> : <>{children}</>;

  const SignedInContent = ({ children }: { children: ReactNode }) =>
    isClerkConfigured ? <SignedIn>{children}</SignedIn> : null;

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6">
      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-center">
        <nav className="hidden items-center rounded-full border border-[#2b3f60]/45 bg-[linear-gradient(180deg,rgba(18,33,54,0.88)_0%,rgba(14,25,44,0.86)_100%)] p-1 pl-4 shadow-[0_12px_34px_rgba(0,0,0,0.42)] backdrop-blur-xl md:flex">
          <div className="flex items-center">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3 py-1.5 text-[0.82rem] font-medium text-[#d3deee]/78 transition-colors hover:text-white"
              >
                {link.name}
              </a>
            ))}
          </div>

          <SignedOutContent>
            <div className="mx-3 h-6 w-px bg-[#4a5c78]/45" />
            <a
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-full border border-[#f0a96a]/45 bg-[linear-gradient(180deg,#1b2235_0%,#141c2f_100%)] px-5 py-2 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(83,104,140,0.55),0_0_0_3px_rgba(240,169,106,0.18),0_10px_24px_rgba(0,0,0,0.42)] transition hover:border-[#f4bd88]/55 hover:shadow-[0_0_0_1px_rgba(93,118,161,0.62),0_0_0_4px_rgba(240,169,106,0.22),0_14px_28px_rgba(0,0,0,0.48)]"
            >
              Sign In
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </SignedOutContent>

          <SignedInContent>
            <div className="mx-3 h-6 w-px bg-[#4a5c78]/45" />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-[#f0a96a]/45 bg-[linear-gradient(180deg,#1b2235_0%,#141c2f_100%)] px-5 py-2 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(83,104,140,0.55),0_0_0_3px_rgba(240,169,106,0.18),0_10px_24px_rgba(0,0,0,0.42)] transition hover:border-[#f4bd88]/55 hover:shadow-[0_0_0_1px_rgba(93,118,161,0.62),0_0_0_4px_rgba(240,169,106,0.22),0_14px_28px_rgba(0,0,0,0.48)]"
            >
              Portal
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <div className="ml-3 mr-1">
              <UserButton appearance={clerkAuthAppearance} afterSignOutUrl="/" />
            </div>
          </SignedInContent>
        </nav>

        <div className="absolute right-0 flex items-center gap-3 md:hidden">
          <SignedInContent>
            <UserButton appearance={clerkAuthAppearance} afterSignOutUrl="/" />
          </SignedInContent>
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full border border-[#2b3f60]/45 bg-[linear-gradient(180deg,rgba(18,33,54,0.88)_0%,rgba(14,25,44,0.86)_100%)] text-white/75 backdrop-blur-xl hover:bg-[#1a2b45] hover:text-white"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] border-white/[0.06] bg-[hsl(220,20%,4%)]">
              <div className="flex flex-col gap-2 px-2 pt-12">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="rounded-lg px-4 py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="my-4 h-px bg-white/[0.06]" />
                <SignedOutContent>
                  <a
                    href="/sign-in"
                    className="flex items-center justify-center rounded-full border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-primary transition-all hover:bg-primary/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </a>
                </SignedOutContent>
                <SignedInContent>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center rounded-full border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-primary transition-all hover:bg-primary/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Portal
                  </Link>
                </SignedInContent>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
