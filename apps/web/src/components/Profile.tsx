"use client";

import { useUser } from '@auth0/nextjs-auth0';
import * as Avatar from '@radix-ui/react-avatar';

const getInitials = (name?: string | null) =>
  name
    ?.split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('') || 'U';

export default function Profile() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-text">Loading user profile...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.name ?? user.nickname ?? user.email ?? 'User';

  return (
    <div className="profile-card action-card">
      <Avatar.Root className="profile-avatar">
        <Avatar.Image
          className="profile-picture"
          src={user.picture ?? undefined}
          alt={displayName}
        />
        <Avatar.Fallback className="profile-fallback" delayMs={200}>
          {getInitials(displayName)}
        </Avatar.Fallback>
      </Avatar.Root>
      <h2 className="profile-name">{displayName}</h2>
      <p className="profile-email">{user.email}</p>
    </div>
  );
}
