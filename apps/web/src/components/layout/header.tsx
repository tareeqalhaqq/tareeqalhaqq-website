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
import { SearchDialog } from "@/components/search-dialog";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center transition-transform hover:scale-[1.01]">
            <Logo />
          </Link>

          <nav className="hidden items-center space-x-6 text-sm font-medium uppercase tracking-[0.2em] md:flex">
            {navLinks.map((link) =>
              link.subLinks ? (
                <DropdownMenu key={link.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/80 transition hover:border-white/10 hover:bg-white/10 hover:text-foreground"
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
                    "rounded-full border border-transparent px-4 py-2 text-xs transition-colors hover:border-white/10 hover:text-foreground",
                    pathname === link.href ? "border-white/10 text-foreground" : "text-foreground/80"
                  )}
                >
                  {link.name}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-foreground/80 hover:bg-white/10 hover:text-foreground"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <Button
              asChild
              className="hidden rounded-full bg-primary px-6 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-primary-foreground shadow-lg shadow-black/30 transition hover:shadow-xl hover:shadow-black/40 md:inline-flex"
            >
              <Link href="/contact">Connect</Link>
            </Button>
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
                  </nav>
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