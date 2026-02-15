'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';

import { clerkAuthAppearance } from '@/lib/clerk-appearance';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!isClerkConfigured) {
    return (
      <motion.div
        className="w-full max-w-sm space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_0_60px_rgba(37,99,235,0.22)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl">
          <Image
            src="/images/logo1.png"
            alt="Tareeq Al Haqq"
            width={64}
            height={64}
            className="h-full w-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-headline text-white">Portal is unavailable</h1>
        <p className="text-sm text-white/50">Authentication is not configured for this environment yet.</p>
        <Link
          href="/"
          className="inline-block text-sm text-primary underline underline-offset-4 hover:text-primary/80"
        >
          Return home
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="pointer-events-none absolute inset-6 -z-10 rounded-[2rem] bg-primary/25 blur-3xl" />

      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/5">
          <Image
            src="/images/logo1.png"
            alt="Tareeq Al Haqq"
            width={56}
            height={56}
            className="h-full w-full object-contain"
          />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">Tareeq Al Haqq</p>
        <h1 className="mt-3 text-3xl font-headline text-white">Member Access</h1>
        <p className="mt-2 text-sm text-white/60">Secure sign in for students and team members.</p>
      </div>

      <SignIn
        appearance={clerkAuthAppearance}
        path="/login"
        routing="path"
        afterSignInUrl="/dashboard"
      />
    </motion.div>
  );
}
