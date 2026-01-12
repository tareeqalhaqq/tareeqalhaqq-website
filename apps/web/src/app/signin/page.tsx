'use client';

import { SignIn } from '@clerk/nextjs';

import { clerkAuthAppearance } from '@/lib/clerk-appearance';

export const dynamic = 'force-dynamic';

export default function SigninPage() {
  return (
    <section className="page-section">
      <div className="page-section__inner mx-auto max-w-5xl space-y-8">
        <div className="space-y-3 text-center">
          <p className="eyebrow">Welcome back</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Sign in to continue</h1>
          <p className="text-sm text-white/70">
            Access your Tareeq Al Haqq Academy dashboard, lessons, and community updates.
          </p>
        </div>
        <div className="glass-panel flex justify-center p-8 md:p-10">
          <div className="w-full max-w-md">
            <SignIn
              appearance={clerkAuthAppearance}
              routing="path"
              path="/signin"
              signUpUrl="/signup"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
