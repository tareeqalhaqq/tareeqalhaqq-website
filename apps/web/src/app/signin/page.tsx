'use client';

import { SignIn } from '@clerk/nextjs';
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
      <div className="glass-panel flex w-full max-w-xl justify-center p-8 md:p-10">
        <div className="w-full max-w-md">
          <SignIn
            appearance={clerkAuthAppearance}
            routing="path"
            path="/signin"
            signUpUrl="/signup"
            afterSignInUrl="/dashboard"
          />
        </div>
      </div>
    </section>
  );
}
