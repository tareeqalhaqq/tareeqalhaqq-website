'use client';

import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';

import { clerkAuthAppearance } from '@/lib/clerk-appearance';

export const dynamic = 'force-dynamic';

export default function SignInPage() {
  const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!isClerkConfigured) {
    return (
      <div className="w-full max-w-sm space-y-3 text-center text-white">
        <h1 className="text-2xl font-semibold">Sign in is unavailable</h1>
        <p className="text-sm text-white/70">Authentication is not configured for this environment yet.</p>
        <Link href="/" className="text-sm underline underline-offset-4">Return home</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <SignIn
        appearance={clerkAuthAppearance}
        path="/sign-in"
        routing="path"
        afterSignInUrl="/dashboard"
      />
    </div>
  );
}
