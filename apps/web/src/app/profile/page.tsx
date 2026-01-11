import { UserProfile } from '@clerk/nextjs';

import { syncUserToSupabase } from '@/app/actions/syncUser';

export default async function ProfilePage() {
  await syncUserToSupabase();

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <UserProfile />
    </div>
  );
}
