'use client';

import { SignIn } from '@clerk/nextjs';

import { clerkAuthAppearance } from '@/lib/clerk-appearance';

export const dynamic = 'force-dynamic';

export default function SigninPage() {
  return (
    <section className="page-section">
      <div className="page-section__inner mx-auto flex max-w-4xl flex-col gap-8">
        <div className="space-y-2 text-center">
          <p className="eyebrow">Welcome back</p>
          <h1 className="text-3xl uppercase tracking-[0.18em] text-white md:text-4xl">Sign in to continue</h1>
          <p className="text-sm text-white/60">
            Access your Tareeq Al Haqq Academy dashboard, lessons, and community updates.
          </p>
        </div>
        <div className="mx-auto w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur-sm md:p-8">
          <SignIn
            appearance={clerkAuthAppearance}
            path="/signin"
            routing="path"
            afterSignInUrl="/dashboard"
          />
        </div>
      </div>
    </section>
  );
}
