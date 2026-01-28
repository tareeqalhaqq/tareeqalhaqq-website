'use client';

import { SignUp } from '@clerk/nextjs';

import { clerkAuthAppearance } from '@/lib/clerk-appearance';

export default function SignUpPage() {
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
