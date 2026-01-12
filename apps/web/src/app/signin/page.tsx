'use client';

import { SignInButton } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';

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
        <div className="flex justify-center">
          <SignInButton mode="redirect" redirectUrl="/signin">
            <Button className="rounded-full bg-primary px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-primary-foreground shadow-lg shadow-black/30 transition hover:shadow-xl hover:shadow-black/40">
              Sign In
            </Button>
          </SignInButton>
        </div>
      </div>
    </section>
  );
}
