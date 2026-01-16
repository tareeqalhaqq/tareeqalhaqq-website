'use client';

import { SignIn } from '@clerk/nextjs';

import { clerkAuthAppearance } from '@/lib/clerk-appearance';

export const dynamic = 'force-dynamic';

export default function SigninPage() {
  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-xl">
        <SignIn
          appearance={clerkAuthAppearance}
          path="/signin"
          routing="path"
          afterSignInUrl="/dashboard"
        />
      </div>
    </section>
  );
}
