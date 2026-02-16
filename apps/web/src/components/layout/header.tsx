"use client";

import Link from "next/link";
import { navLinks } from "@/lib/data";
import { ArrowRight, LayoutDashboard, User, LogOut, ChevronDown } from "lucide-react";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const SignedOutContent = ({ children }: { children: ReactNode }) =>
    isClerkConfigured ? <SignedOut>{children}</SignedOut> : <>{children}</>;

  const SignedInContent = ({ children }: { children: ReactNode }) =>
    isClerkConfigured ? <SignedIn>{children}</SignedIn> : null;

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6">
      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-center">
        {/* ── Signed-out: desktop nav ── */}
        <SignedOutContent>
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
            <div className="mx-3 h-6 w-px bg-[#4a5c78]/45" />
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-[#f0a96a]/45 bg-[linear-gradient(180deg,#1b2235_0%,#141c2f_100%)] px-5 py-2 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(83,104,140,0.55),0_0_0_3px_rgba(240,169,106,0.18),0_10px_24px_rgba(0,0,0,0.42)] transition hover:border-[#f4bd88]/55 hover:shadow-[0_0_0_1px_rgba(93,118,161,0.62),0_0_0_4px_rgba(240,169,106,0.22),0_14px_28px_rgba(0,0,0,0.48)]"
            >
              Portal
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </nav>

          {/* ── Signed-out: mobile — just Portal button ── */}
          <div className="absolute right-0 md:hidden">
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-[#f0a96a]/45 bg-[linear-gradient(180deg,#1b2235_0%,#141c2f_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(83,104,140,0.55),0_0_0_3px_rgba(240,169,106,0.18),0_10px_24px_rgba(0,0,0,0.42)] backdrop-blur-xl transition hover:border-[#f4bd88]/55 hover:shadow-[0_0_0_1px_rgba(93,118,161,0.62),0_0_0_4px_rgba(240,169,106,0.22),0_14px_28px_rgba(0,0,0,0.48)]"
            >
              Portal
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </SignedOutContent>

        {/* ── Signed-in: authenticated topbar ── */}
        <SignedInContent>
          <AuthenticatedNav />
        </SignedInContent>
      </div>
    </header>
  );
}

function AuthenticatedNav() {
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" });
  };

  return (
    <>
      {/* Desktop authenticated nav */}
      <nav className="hidden items-center rounded-full border border-[#2b3f60]/45 bg-[linear-gradient(180deg,rgba(18,33,54,0.88)_0%,rgba(14,25,44,0.86)_100%)] p-1 pl-4 shadow-[0_12px_34px_rgba(0,0,0,0.42)] backdrop-blur-xl md:flex">
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[0.82rem] font-medium text-[#d3deee]/78 transition-colors hover:text-white"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[0.82rem] font-medium text-[#d3deee]/78 transition-colors hover:text-white"
          >
            <User className="h-3.5 w-3.5" />
            Profile
          </Link>
        </div>

        <div className="mx-3 h-6 w-px bg-[#4a5c78]/45" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-full border border-[#f0a96a]/45 bg-[linear-gradient(180deg,#1b2235_0%,#141c2f_100%)] px-5 py-2 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(83,104,140,0.55),0_0_0_3px_rgba(240,169,106,0.18),0_10px_24px_rgba(0,0,0,0.42)] transition hover:border-[#f4bd88]/55 hover:shadow-[0_0_0_1px_rgba(93,118,161,0.62),0_0_0_4px_rgba(240,169,106,0.22),0_14px_28px_rgba(0,0,0,0.48)]">
              Account
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-48 rounded-xl border border-white/[0.08] bg-[hsl(220,22%,8%)] text-white shadow-2xl shadow-black/60"
          >
            <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-lg text-white/70 focus:bg-white/[0.06] focus:text-white">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-lg text-white/70 focus:bg-white/[0.06] focus:text-white">
              <Link href="/profile">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.08]" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer gap-2 rounded-lg text-red-400 focus:bg-red-500/10 focus:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Mobile authenticated nav */}
      <div className="absolute right-0 flex items-center gap-3 md:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-[#2b3f60]/45 bg-[linear-gradient(180deg,rgba(18,33,54,0.88)_0%,rgba(14,25,44,0.86)_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_34px_rgba(0,0,0,0.42)] backdrop-blur-xl transition hover:border-[#4a5c78]/55"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2b3f60]/45 bg-[linear-gradient(180deg,rgba(18,33,54,0.88)_0%,rgba(14,25,44,0.86)_100%)] text-white/75 shadow-[0_12px_34px_rgba(0,0,0,0.42)] backdrop-blur-xl transition hover:text-white">
              <User className="h-4 w-4" />
              <span className="sr-only">Account menu</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-48 rounded-xl border border-white/[0.08] bg-[hsl(220,22%,8%)] text-white shadow-2xl shadow-black/60"
          >
            <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-lg text-white/70 focus:bg-white/[0.06] focus:text-white">
              <Link href="/profile">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.08]" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer gap-2 rounded-lg text-red-400 focus:bg-red-500/10 focus:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
