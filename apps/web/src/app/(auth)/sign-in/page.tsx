'use client';

import { SignIn } from '@clerk/nextjs';

import { clerkAuthAppearance } from '@/lib/clerk-appearance';

export const dynamic = 'force-dynamic';

export default function SignInPage() {
  return (
    <div className="w-full max-w-md">
      <SignIn
        appearance={clerkAuthAppearance}
        path="/sign-in"
        routing="path"
        afterSignInUrl="/dashboard"
      />
    </div>
  );
}
