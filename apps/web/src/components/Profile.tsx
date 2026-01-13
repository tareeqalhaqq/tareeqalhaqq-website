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
      <div className="loading-state">
        <div className="loading-text">Loading user profile...</div>
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
    <div className="profile-card action-card">
      <Avatar.Root className="profile-avatar">
        <Avatar.Image
          className="profile-picture"
          src={user.imageUrl ?? undefined}
          alt={displayName}
        />
        <Avatar.Fallback className="profile-fallback" delayMs={200}>
          {getInitials(displayName)}
        </Avatar.Fallback>
      </Avatar.Root>
      <h2 className="profile-name">{displayName}</h2>
      {email && <p className="profile-email">{email}</p>}
    </div>
  );
}
