'use client';

import { SignIn } from '@clerk/nextjs';

import { clerkAuthAppearance } from '@/lib/clerk-appearance';

export const dynamic = 'force-dynamic';

export default function SigninPage() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/4 rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>
      <div className="page-section__inner mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="space-y-6 text-center lg:text-left">
          <p className="eyebrow">Welcome back</p>
          <h1 className="text-3xl uppercase tracking-[0.18em] text-white md:text-4xl">
            Sign in to continue
          </h1>
          <p className="text-sm text-white/70">
            Access your Tareeq Al Haqq Academy dashboard, lessons, and community updates in one focused space.
          </p>
          <div className="grid gap-3 text-left text-sm text-white/70">
            {[
              'Keep your dashboard, notes, and highlights in sync.',
              'Pick up exactly where you left off in your learning path.',
              'Stay close to verified sources and curated guidance.',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-8">
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
