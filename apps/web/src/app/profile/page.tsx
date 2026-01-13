import Profile from '@/components/Profile';
import LogoutButton from '@/components/LogoutButton';
import { syncUserToSupabase } from '@/app/actions/syncUser';

export default async function ProfilePage() {
  await syncUserToSupabase();

  return (
    <main className="app-container">
      <div className="main-card-wrapper">
        <h1 className="main-title">Your profile</h1>
        <Profile />
        <LogoutButton />
      </div>
    </main>
  );
}
