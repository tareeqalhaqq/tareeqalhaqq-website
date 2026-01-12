'use client';

import { SignIn } from '@clerk/nextjs';

import { clerkAuthAppearance } from '@/lib/clerk-appearance';

export const dynamic = 'force-dynamic';

export default function SigninPage() {
  return (
    <section className="page-section">
      <div className="page-section__inner mx-auto flex max-w-5xl flex-col gap-8">
        <div className="space-y-3 text-center">
          <p className="eyebrow">Welcome back</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Sign in to continue</h1>
          <p className="text-sm text-white/70">
            Access your Tareeq Al Haqq Academy dashboard, lessons, and community updates.
          </p>
        </div>
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          <SignIn appearance={clerkAuthAppearance} path="/signin" routing="path" />
        </div>
      </div>
    </section>
  );
}
