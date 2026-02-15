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
        className="w-full max-w-sm space-y-4 text-center"
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
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl">
          <Image
            src="/images/logo1.png"
            alt="Tareeq Al Haqq"
            width={56}
            height={56}
            className="h-full w-full object-contain"
          />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">Tareeq Al Haqq</p>
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
