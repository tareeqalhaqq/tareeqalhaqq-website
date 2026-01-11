'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <section className="page-section">
      <div className="page-section__inner mx-auto max-w-5xl space-y-8">
        <div className="space-y-3 text-center">
          <p className="eyebrow">Member Access</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Sign In</h1>
          <p className="text-base text-white/70">
            Access your personalised Academy dashboard and pick up where you left off with curated learning tracks.
          </p>
        </div>
        <div className="glass-panel flex justify-center p-6">
          <SignIn
            appearance={{ elements: { card: 'bg-transparent shadow-none' } }}
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
