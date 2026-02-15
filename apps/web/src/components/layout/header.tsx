"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Logo } from "@/components/icons";
import { navLinks } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { clerkAuthAppearance } from "@/lib/clerk-appearance";
import { ReactNode } from "react";

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const SignedOutContent = ({ children }: { children: ReactNode }) =>
    isClerkConfigured ? <SignedOut>{children}</SignedOut> : <>{children}</>;

  const SignedInContent = ({ children }: { children: ReactNode }) =>
    isClerkConfigured ? <SignedIn>{children}</SignedIn> : null;

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-[hsl(220,20%,4%)]/80 backdrop-blur-lg border-b border-white/[0.04]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        {/* Logo - fades in on scroll */}
        <Link
          href="/"
          className={`flex items-center transition-all duration-500 ${
            scrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <Logo />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white"
            >
              {link.name}
            </a>
          ))}

          <SignedOutContent>
            <a
              href="/sign-in"
              className="ml-3 inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary transition-all hover:border-primary/60 hover:bg-primary/20"
            >
              Sign In
            </a>
          </SignedOutContent>

          <SignedInContent>
            <Link
              href="/dashboard"
              className="ml-3 inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary transition-all hover:border-primary/60 hover:bg-primary/20"
            >
              Portal
            </Link>
            <div className="ml-3">
              <UserButton appearance={clerkAuthAppearance} afterSignOutUrl="/" />
            </div>
          </SignedInContent>
        </nav>

        {/* Mobile */}
        <div className="flex items-center gap-3 md:hidden">
          <SignedInContent>
            <UserButton appearance={clerkAuthAppearance} afterSignOutUrl="/" />
          </SignedInContent>
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white/70 hover:bg-white/5 hover:text-white"
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
