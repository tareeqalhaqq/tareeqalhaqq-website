"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/icons";
import { navLinks } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Search, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { clerkAuthAppearance } from "@/lib/clerk-appearance";

const SearchDialog = dynamic(
  () => import("@/components/search-dialog").then((mod) => mod.SearchDialog),
  { ssr: false }
);

const dashboardLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Profile", href: "/profile" },
  { name: "Settings", href: "/account/preferences" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full px-3 py-3 sm:px-4">
        <div className="group relative mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-full border border-white/10 bg-black/60 px-4 py-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition duration-300 before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_55%)] before:opacity-70 before:blur-2xl after:absolute after:-inset-px after:-z-10 after:rounded-full after:bg-gradient-to-r after:from-white/15 after:via-transparent after:to-white/15 after:opacity-0 after:transition after:duration-300 group-hover:border-white/20 group-hover:after:opacity-100 sm:px-6 sm:py-3">
          <Link href="/" className="flex items-center transition-transform hover:scale-[1.01]">
            <Logo />
          </Link>

          <nav className="hidden items-center space-x-3 text-xs font-semibold uppercase tracking-[0.22em] md:flex lg:space-x-5">
            <SignedOut>
              {navLinks.map((link) =>
                link.subLinks ? (
                  <DropdownMenu key={link.name}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-foreground/80 transition hover:border-white/10 hover:bg-white/10 hover:text-foreground"
                      >
                        {link.name}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[200px] overflow-hidden rounded-2xl border border-white/10 bg-secondary/60 backdrop-blur-xl">
                      {link.subLinks.map((subLink) => (
                        <DropdownMenuItem key={subLink.name} asChild>
                          <Link href={subLink.href} className="text-xs uppercase tracking-[0.25em] text-foreground/80 hover:text-primary">
                            {subLink.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href!}
                    className={cn(
                      "rounded-full border border-transparent px-4 py-2 text-[0.65rem] font-semibold tracking-[0.28em] text-foreground/70 transition-colors hover:border-white/10 hover:text-foreground",
                      pathname === link.href ? "border-white/10 text-foreground" : "text-foreground/70"
                    )}
                  >
                    {link.name}
                  </Link>
                )
              )}
            </SignedOut>
            <SignedIn>
              {dashboardLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "rounded-full border border-transparent px-4 py-2 text-[0.65rem] font-semibold tracking-[0.28em] text-foreground/70 transition-colors hover:border-white/10 hover:text-foreground",
                    pathname === link.href ? "border-white/10 text-foreground" : "text-foreground/70"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </SignedIn>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border border-white/10 bg-white/5 text-foreground/80 transition hover:bg-white/10 hover:text-foreground sm:h-10 sm:w-10"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <SignedOut>
              <div className="hidden items-center gap-2 md:flex">
                <Button
                  asChild
                  className="rounded-full bg-primary px-6 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-primary-foreground shadow-lg shadow-black/30 transition hover:shadow-xl hover:shadow-black/40"
                >
                  <Link href="/signin">Sign In</Link>
                </Button>
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={clerkAuthAppearance}
                afterSignOutUrl="/"
              />
            </SignedIn>
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-foreground/80 hover:bg-white/10 hover:text-foreground"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] border-white/10 bg-black/80 text-foreground">
                <div className="p-6">
                  <Link href="/" className="mb-8 block" onClick={() => setMobileMenuOpen(false)}>
                    <Logo className="text-left" />
                  </Link>
                  <nav className="flex flex-col space-y-4">
                    <SignedIn>
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
                          Dashboard
                        </p>
                        <div className="ml-2 flex flex-col space-y-2">
                          {dashboardLinks.map((link) => (
                            <Link
                              key={link.name}
                              href={link.href}
                              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {link.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </SignedIn>
                    <SignedOut>
                      {navLinks.map((link) => (
                        <div key={link.name}>
                          {link.subLinks ? (
                            <div className="space-y-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
                                {link.name}
                              </p>
                              <div className="ml-2 flex flex-col space-y-2">
                                {link.subLinks.map((subLink) => (
                                  <Link
                                    key={subLink.name}
                                    href={subLink.href}
                                    className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {subLink.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <Link
                              href={link.href!}
                              className={cn(
                                "rounded-full px-4 py-2 text-sm uppercase tracking-[0.3em] text-muted-foreground transition hover:bg-white/10 hover:text-foreground",
                                pathname === link.href && "bg-white/10 text-foreground"
                              )}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {link.name}
                            </Link>
                          )}
                        </div>
                      ))}
                    </SignedOut>
                  </nav>
                  <div className="mt-8 space-y-3">
                    <SignedOut>
                      <Button
                        asChild
                        className="w-full rounded-full bg-primary px-6 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-primary-foreground shadow-lg shadow-black/30 transition hover:shadow-xl hover:shadow-black/40"
                      >
                        <Link href="/signin">Sign In</Link>
                      </Button>
                    </SignedOut>
                    <SignedIn>
                      <div className="flex items-center justify-center">
                        <UserButton
                          appearance={clerkAuthAppearance}
                          afterSignOutUrl="/"
                        />
                      </div>
                    </SignedIn>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <SearchDialog open={isSearchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
