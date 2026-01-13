import { SignOutButton } from '@clerk/nextjs';
import Profile from '@/components/Profile';
import { syncUserToSupabase } from '@/app/actions/syncUser';
import { Button } from '@/components/ui/button';

export default async function ProfilePage() {
  await syncUserToSupabase();

  return (
    <main className="page-section">
      <div className="page-section__inner space-y-8">
        <div className="glass-panel space-y-6 p-8 text-center text-white">
          <p className="eyebrow">Account</p>
          <h1 className="text-3xl font-headline uppercase tracking-[0.2em]">Your profile</h1>
          <Profile />
          <SignOutButton>
            <Button className="rounded-full bg-white/10 px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 hover:bg-white/20">
              Log Out
            </Button>
          </SignOutButton>
        </div>
      </div>
    </main>
  );
}
