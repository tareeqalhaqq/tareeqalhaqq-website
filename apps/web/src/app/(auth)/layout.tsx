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
    <div className="auth-gradient-bg flex min-h-screen w-full flex-col items-center justify-center px-6 py-12">
      {/* Back to home link */}
      <motion.div
        className="absolute left-6 top-6"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-white/40 transition-colors hover:text-white/70"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>
      </motion.div>

      {children}
    </div>
  );
}
