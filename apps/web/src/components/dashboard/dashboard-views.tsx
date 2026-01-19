'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { EventsManager } from '@/components/admin/events-manager';
import { Button } from '@/components/ui/button';
import type { AuthStatus, Profile, Role, User } from '@/hooks/use-auth-profile';

type DashboardAuthState = {
  status: AuthStatus;
  user: User | null;
  profile: Profile | null;
  role: Role;
  isAdmin: boolean;
  isStudent: boolean;
};

type UserDashboardPanelsProps = {
  auth: DashboardAuthState;
  showAdminCta?: boolean;
};

function UserDashboardPanels({ auth, showAdminCta = true }: UserDashboardPanelsProps) {
  const { profile, user, role, isAdmin } = auth;
  const displayName = profile?.full_name ?? user?.email ?? 'there';
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : null;

  return (
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
          {showAdminCta && isAdmin && (
            <Button asChild variant="ghost">
              <Link href="/dashboard/admin">Admin view</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-white/50">Overview</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass-panel space-y-3 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-white/60">Dashboard</p>
            <p className="text-lg font-semibold">Your account overview</p>
            <p className="text-sm text-white/70">Review your profile details and account settings.</p>
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

        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-white/50">Profile</p>
        </div>
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
              Add your preferred name, upload a photo, and select your learning track to keep everything aligned with
              your studies.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/profile">Update profile</Link>
            </Button>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-white/50">Account</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass-panel space-y-3 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-white/60">Account settings</p>
            <p className="text-lg font-semibold">Manage your preferences</p>
            <p className="text-sm text-white/70">
              Update your profile details and review sign-in preferences in your account settings.
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
      </div>
    </>
  );
}

type UserDashboardViewProps = {
  auth: DashboardAuthState;
  showAdminCta?: boolean;
};

export function UserDashboardView({ auth, showAdminCta = true }: UserDashboardViewProps) {
  const { status } = auth;

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
              <Link href="/sign-in">Go to sign in</Link>
            </Button>
          </div>
        )}
        {status === 'authenticated' && <UserDashboardPanels auth={auth} showAdminCta={showAdminCta} />}
      </div>
    </section>
  );
}

type StudentDashboardViewProps = {
  auth: DashboardAuthState;
};

export function StudentDashboardView({ auth }: StudentDashboardViewProps) {
  const { status, profile, role } = auth;
  const isAuthorized = status === 'authenticated' && role === 'student';

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-6">
        {status === 'loading' && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Dashboard</p>
            <h1 className="text-3xl font-semibold">Preparing your student view</h1>
            <p className="text-sm text-white/70">Checking your account access…</p>
          </div>
        )}
        {status === 'unauthenticated' && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Student access required</p>
            <h1 className="text-3xl font-semibold">Sign in to continue</h1>
            <p className="text-sm text-white/70">
              This area is reserved for enrolled students. Please sign in to verify your credentials.
            </p>
            <Button asChild>
              <Link href="/sign-in">Go to sign in</Link>
            </Button>
          </div>
        )}
        {status === 'authenticated' && !isAuthorized && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Access restricted</p>
            <h1 className="text-3xl font-semibold">Student permissions required</h1>
            <p className="text-sm text-white/70">
              Your account does not have student access. Return to your dashboard to continue.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        )}
        {isAuthorized && (
          <>
            <div className="glass-panel space-y-3 p-8 text-white">
              <p className="eyebrow">Dashboard</p>
              <h1 className="text-3xl font-semibold">Student home</h1>
              <p className="text-sm text-white/70">
                {profile?.full_name ? `Glad to have you back, ${profile.full_name}. ` : ''}Jump into your lessons, keep
                track of progress, and stay connected with the academy.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild>
                  <a href="https://markazalhaqq.org">Continue learning</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/logout">Sign out</a>
                </Button>
              </div>
            </div>
            <div className="glass-panel grid gap-4 p-6 text-white md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-white/60">Courses</p>
                <p className="text-lg font-semibold">Pick up where you left off</p>
                <p className="text-sm text-white/70">Resume your latest lesson and keep your streak alive.</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-white/60">Resources</p>
                <p className="text-lg font-semibold">Explore the library</p>
                <p className="text-sm text-white/70">Download guides and watch recordings to reinforce learning.</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-white/60">Account</p>
                <p className="text-lg font-semibold">Manage your profile</p>
                <p className="text-sm text-white/70">Update your details and adjust notification preferences.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

type AdminDashboardViewProps = {
  auth: DashboardAuthState;
};

export function AdminDashboardView({ auth }: AdminDashboardViewProps) {
  const router = useRouter();
  const { status, profile, isAdmin } = auth;
  const isAuthorized = status === 'authenticated' && isAdmin;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/sign-in');
    }
  }, [router, status]);

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-6">
        {status === 'loading' && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Dashboard</p>
            <h1 className="text-3xl font-semibold">Preparing your admin view</h1>
            <p className="text-sm text-white/70">Checking your account access…</p>
          </div>
        )}
        {status === 'unauthenticated' && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Admin access required</p>
            <h1 className="text-3xl font-semibold">Sign in to continue</h1>
            <p className="text-sm text-white/70">
              This area is reserved for administrators. Please sign in to verify your credentials.
            </p>
            <Button asChild>
              <Link href="/sign-in">Go to sign in</Link>
            </Button>
          </div>
        )}
        {status === 'authenticated' && !isAuthorized && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Access restricted</p>
            <h1 className="text-3xl font-semibold">Admin permissions required</h1>
            <p className="text-sm text-white/70">
              Your account does not have administrator permissions. Return to your dashboard to continue.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        )}
        {isAuthorized && (
          <>
            <div className="glass-panel space-y-3 p-8 text-white">
              <p className="eyebrow">Dashboard</p>
              <h1 className="text-3xl font-semibold">Admin overview</h1>
              <p className="text-sm text-white/70">
                Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}. Manage the academy experience and keep
                everything running smoothly.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild>
                  <a href="https://markazalhaqq.org">View academy site</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/logout">Sign out</a>
                </Button>
              </div>
            </div>

            <UserDashboardPanels auth={auth} showAdminCta={false} />

            <div className="glass-panel grid gap-4 p-6 text-white md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-white/60">Members</p>
                <p className="text-lg font-semibold">Monitor enrollment</p>
                <p className="text-sm text-white/70">Track how students are engaging across lessons and resources.</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-white/60">Content</p>
                <p className="text-lg font-semibold">Curate learning</p>
                <p className="text-sm text-white/70">Review course material and keep your community up to date.</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-white/60">Access</p>
                <p className="text-lg font-semibold">Secure admin workflows</p>
                <p className="text-sm text-white/70">Confirm roles, review sign-ins, and keep admin tools protected.</p>
              </div>
            </div>

            <EventsManager adminName={profile?.full_name ?? undefined} />
          </>
        )}
      </div>
    </section>
  );
}
