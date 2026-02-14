'use client';

import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';

import { clerkAuthAppearance } from '@/lib/clerk-appearance';

export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!isClerkConfigured) {
    return (
      <div className="w-full max-w-sm space-y-3 text-center text-white">
        <h1 className="text-2xl font-semibold">Sign up is unavailable</h1>
        <p className="text-sm text-white/70">Authentication is not configured for this environment yet.</p>
        <Link href="/" className="text-sm underline underline-offset-4">Return home</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <SignUp
        appearance={clerkAuthAppearance}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
}
