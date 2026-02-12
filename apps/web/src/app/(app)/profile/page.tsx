import { UserProfile } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <UserProfile />
    </div>
  );
}
