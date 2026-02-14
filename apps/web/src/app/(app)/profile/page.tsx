import Link from 'next/link';
import { UserProfile } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!isClerkConfigured) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-20 text-white">
        <h1 className="text-3xl font-semibold">Profile unavailable</h1>
        <p className="text-white/70">Authentication is not configured for this environment.</p>
        <Link href="/" className="underline underline-offset-4">Return home</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <UserProfile />
    </div>
  );
}
