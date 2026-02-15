'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-gradient-bg relative flex min-h-screen w-full flex-col items-center justify-center px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.18),transparent_45%)]" />

      <motion.div
        className="absolute left-6 top-6"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-white/45 transition-colors hover:text-white/75"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>
      </motion.div>

      {children}
    </div>
  );
}
