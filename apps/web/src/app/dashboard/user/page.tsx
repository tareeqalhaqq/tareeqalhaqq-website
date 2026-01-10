'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthProfile } from '@/hooks/use-auth-profile';

export default function UserDashboardPage() {
  const { status, profile, user, isAdmin, role } = useAuthProfile();
  const displayName = profile?.full_name ?? user?.email ?? 'there';
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : null;

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-8">
        {status === 'loading' && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Dashboard</p>
            <h1 className="text-3xl font-semibold">Preparing your dashboard</h1>
            <p className="text-sm text-white/70">Loading your account details…</p>
          </div>
        )}
        {status === 'unauthenticated' && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Member access required</p>
            <h1 className="text-3xl font-semibold">Sign in to continue</h1>
            <p className="text-sm text-white/70">
              Please sign in to access your dashboard tools and account settings.
            </p>
            <Button asChild>
              <Link href="/signin">Go to sign in</Link>
            </Button>
          </div>
        )}
        {status === 'authenticated' && (
          <>
            <div className="glass-panel space-y-3 p-8 text-white">
              <p className="eyebrow">Dashboard</p>
              <h1 className="text-3xl font-semibold">Assalamu Alaikum, {displayName}!</h1>
              <p className="text-sm text-white/70">
                You&apos;re signed in to your Tareeq Al Haqq account. We&apos;ve tailored this space using the profile details
                stored in your account so your experience feels personal and intentional.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild>
                  <Link href="/profile">Profile</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/account/preferences">Account Settings</Link>
                </Button>
                {isAdmin && (
                  <Button asChild variant="ghost">
                    <Link href="/dashboard/admin">Admin view</Link>
                  </Button>
                )}
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="glass-panel flex w-full flex-wrap gap-2 border border-white/10 bg-white/10 p-2 text-white">
                <TabsTrigger
                  value="overview"
                  className="rounded-full px-5 py-2 text-[0.65rem] uppercase tracking-[0.28em] text-white/70 transition data-[state=active]:bg-white data-[state=active]:text-slate-900"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="rounded-full px-5 py-2 text-[0.65rem] uppercase tracking-[0.28em] text-white/70 transition data-[state=active]:bg-white data-[state=active]:text-slate-900"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="rounded-full px-5 py-2 text-[0.65rem] uppercase tracking-[0.28em] text-white/70 transition data-[state=active]:bg-white data-[state=active]:text-slate-900"
                >
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="glass-panel space-y-3 p-6 text-white">
                    <p className="text-sm uppercase tracking-[0.18em] text-white/60">Dashboard</p>
                    <p className="text-lg font-semibold">Your account overview</p>
                    <p className="text-sm text-white/70">Review your profile details and account settings.</p>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/dashboard/user">Open dashboard</Link>
                    </Button>
                  </div>
                  <div className="glass-panel space-y-3 p-6 text-white">
                    <p className="text-sm uppercase tracking-[0.18em] text-white/60">App</p>
                    <p className="text-lg font-semibold">Continue learning</p>
                    <p className="text-sm text-white/70">Launch the learning experience and pick up where you left off.</p>
                    <Button asChild className="w-full">
                      <Link href="/mobile">Open the app</Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                  <div className="glass-panel space-y-4 p-6 text-white">
                    <p className="text-sm uppercase tracking-[0.18em] text-white/60">Your greeting</p>
                    <p className="text-lg font-semibold">
                      {profile?.full_name ? profile.full_name : 'Your profile name is ready to be completed.'}
                    </p>
                    <p className="text-sm text-white/70">
                      {profile?.full_name
                        ? 'This name comes from your profile record and will be used across your dashboard.'
                        : 'Add your full name in your profile to personalize your dashboard experience.'}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-white/60">
                      <span className="rounded-full bg-white/5 px-3 py-1">Email: {user?.email ?? 'Unavailable'}</span>
                      <span className="rounded-full bg-white/5 px-3 py-1">Role: {role ?? 'member'}</span>
                      {memberSince && <span className="rounded-full bg-white/5 px-3 py-1">Member since {memberSince}</span>}
                    </div>
                  </div>
                  <div className="glass-panel space-y-4 p-6 text-white">
                    <p className="text-sm uppercase tracking-[0.18em] text-white/60">Next steps</p>
                    <p className="text-lg font-semibold">Complete your profile journey</p>
                    <p className="text-sm text-white/70">
                      Add your preferred name, upload a photo, and select your learning track to keep everything aligned
                      with your studies.
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/profile">Update profile</Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="glass-panel space-y-3 p-6 text-white">
                    <p className="text-sm uppercase tracking-[0.18em] text-white/60">Account</p>
                    <p className="text-lg font-semibold">Account settings</p>
                    <p className="text-sm text-white/70">
                      Update your password, manage sign-in preferences, and review your account details.
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/account/preferences">Open settings</Link>
                    </Button>
                  </div>
                  <div className="glass-panel flex flex-col gap-3 p-6 text-white">
                    <p className="text-sm uppercase tracking-[0.18em] text-white/60">Session</p>
                    <p className="text-lg font-semibold">Sign out securely</p>
                    <p className="text-sm text-white/70">
                      Done for now? Log out to keep your account secure and pick up where you left off later.
                    </p>
                    <div className="mt-auto">
                      <Button asChild variant="destructive" className="w-full">
                        <Link href="/logout">Log out</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </section>
  );
}
