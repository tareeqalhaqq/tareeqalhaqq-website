import { SignOutButton } from '@clerk/nextjs';
import Profile from '@/components/Profile';
import { syncUserToSupabase } from '@/app/actions/syncUser';

export default async function ProfilePage() {
  await syncUserToSupabase();

  return (
    <main className="app-container">
      <div className="main-card-wrapper">
        <h1 className="main-title">Your profile</h1>
        <Profile />
        <SignOutButton>
          <button className="button logout">Log Out</button>
        </SignOutButton>
      </div>
    </main>
  );
}
