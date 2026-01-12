'use client';

import { SignIn } from '@clerk/nextjs';

import { clerkAuthAppearance } from '@/lib/clerk-appearance';

export const dynamic = 'force-dynamic';

export default function SigninPage() {
  return (
    <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-6 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute bottom-12 right-8 h-72 w-72 rounded-full bg-cyan-500/10 blur-[160px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/3 rounded-full bg-slate-500/10 blur-[180px]" />
      </div>
      <div className="page-section__inner mx-auto flex max-w-5xl justify-center">
        <div className="w-full max-w-xl">
          <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:px-10">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary/80">
                Welcome back
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                Sign in to your account
              </h1>
              <p className="mt-3 text-sm text-white/65">
                Choose a sign-in option below to continue to your dashboard.
              </p>
              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:px-6">
                <SignIn
                  appearance={clerkAuthAppearance}
                  path="/signin"
                  routing="path"
                  afterSignInUrl="/dashboard"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
