'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignupPage() {
  return (
    <section className="page-section">
      <div className="page-section__inner mx-auto max-w-5xl space-y-8">
        <div className="space-y-3 text-center">
          <p className="eyebrow">New to the Academy</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Create your account</h1>
          <p className="text-sm text-white/70">
            Begin your journey with Tareeq Al Haqq. Register below to access lessons, community updates, and your
            personal dashboard.
          </p>
        </div>
        <div className="glass-panel flex justify-center p-6">
          <SignUp
            appearance={{ elements: { card: 'bg-transparent shadow-none' } }}
            routing="path"
            path="/signup"
            signInUrl="/signin"
            afterSignUpUrl="/dashboard"
          />
        </div>
      </div>
    </section>
  );
}
