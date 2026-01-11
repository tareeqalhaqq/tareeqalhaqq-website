'use client';

import { ClerkLoaded, ClerkLoading, SignIn } from '@clerk/nextjs';
import Link from 'next/link';

import { clerkAuthAppearance } from '@/lib/clerk-appearance';

export default function SignInPage() {
  return (
    <section className="relative flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Link
        href="/"
        className="absolute left-6 top-6 text-sm font-medium text-white/70 transition hover:text-white"
      >
        Return
      </Link>
      <div className="glass-panel flex w-full max-w-2xl flex-col gap-6 p-8 md:p-10">
        <div className="space-y-2 text-center text-white">
          <p className="eyebrow">Welcome back</p>
          <h1 className="text-3xl font-semibold">Sign in to your account</h1>
          <p className="text-sm text-white/70">
            Choose a sign-in option below to continue to your dashboard.
          </p>
        </div>
        <div className="mx-auto w-full max-w-md">
          <ClerkLoaded>
            <SignIn
              appearance={clerkAuthAppearance}
              routing="path"
              path="/signin"
              signUpUrl="/signup"
              afterSignInUrl="/dashboard"
            />
          </ClerkLoaded>
          <ClerkLoading>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-white/70">
              Loading sign-in options…
            </div>
          </ClerkLoading>
        </div>
      </div>
    </section>
  );
}
