"use client";

import { useUser } from '@clerk/nextjs';
import * as Avatar from '@radix-ui/react-avatar';

const getInitials = (name?: string | null) =>
  name
    ?.split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('') || 'U';

export default function Profile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="glass-panel p-6 text-center text-sm text-white/70">
        Loading user profile...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName =
    user.fullName ??
    user.username ??
    user.primaryEmailAddress?.emailAddress ??
    'User';
  const email = user.primaryEmailAddress?.emailAddress ?? null;

  return (
    <div className="space-y-4 text-center">
      <Avatar.Root className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10">
        <Avatar.Image
          className="h-full w-full object-cover"
          src={user.imageUrl ?? undefined}
          alt={displayName}
        />
        <Avatar.Fallback className="text-lg font-semibold text-white" delayMs={200}>
          {getInitials(displayName)}
        </Avatar.Fallback>
      </Avatar.Root>
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-white">{displayName}</h2>
        {email && <p className="text-sm text-white/70">{email}</p>}
      </div>
    </div>
  );
}
