'use client';

import Image from 'next/image';
import { Search, Menu } from 'lucide-react';
import { SignIn } from '@clerk/nextjs';

import { clerkAuthAppearance } from '@/lib/clerk-appearance';

export const dynamic = 'force-dynamic';

export default function SigninPage() {
  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-12 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 rounded-full bg-cyan-500/10 blur-[160px]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl space-y-14">
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between rounded-full border border-white/10 bg-slate-950/70 px-4 py-3 shadow-[0_18px_45px_-25px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5">
              <Image src="/images/logo1.png" alt="Tareeq Al Haqq" width={44} height={44} />
            </span>
            <div className="leading-none">
              <p className="text-[10px] uppercase tracking-[0.45em] text-primary/80">Tareeq</p>
              <p className="text-lg font-headline uppercase tracking-[0.2em] text-white">Al Haqq</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:text-white"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:text-white"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-xl rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_28px_60px_-40px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-8">
          <div className="space-y-5 text-center">
            <p className="eyebrow">Welcome back</p>
            <h1 className="text-3xl font-headline text-white sm:text-4xl">
              Sign in to your account
            </h1>
            <p className="text-sm text-white/70">
              Choose a sign-in option below to continue to your dashboard.
            </p>
          </div>
          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <SignIn
              appearance={clerkAuthAppearance}
              path="/signin"
              routing="path"
              afterSignInUrl="/dashboard"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
