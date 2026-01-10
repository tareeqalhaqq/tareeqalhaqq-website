'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthProfile } from '@/hooks/use-auth-profile';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';

export default function AccountPreferencesPage() {
  const router = useRouter();
  const { status, user } = useAuthProfile();
  const { toast } = useToast();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/signin');
    }
  }, [router, status]);

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      toast({
        title: 'Missing details',
        description: 'Please enter and confirm your new password.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please confirm the same password in both fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsSaving(false);
      return;
    }

    setPassword('');
    setConfirmPassword('');
    toast({
      title: 'Password updated',
      description: 'Your password has been updated successfully.',
    });
    setIsSaving(false);
  };

  if (status === 'loading') {
    return (
      <section className="page-section">
        <div className="page-section__inner">
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Account settings</p>
            <h1 className="text-3xl font-semibold">Loading preferences</h1>
            <p className="text-sm text-white/70">Preparing your account settings…</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-6">
        <div className="glass-panel space-y-3 p-8 text-white">
          <p className="eyebrow">Account settings</p>
          <h1 className="text-3xl font-semibold">Manage your preferences</h1>
          <p className="text-sm text-white/70">Update your sign-in details and keep your account secure.</p>
        </div>

        <div className="glass-panel space-y-6 p-8 text-white">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.3em] text-white/70" htmlFor="password">
              New password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter a new password"
              className="border-white/20 bg-black/40 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.3em] text-white/70" htmlFor="confirmPassword">
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your new password"
              className="border-white/20 bg-black/40 text-white"
            />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            Signed in as <span className="text-white">{user?.email ?? 'Unknown'}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleUpdatePassword} disabled={isSaving}>
              {isSaving ? 'Updating…' : 'Update password'}
            </Button>
            <Button asChild variant="outline">
              <Link href="/profile">Edit profile</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/dashboard/user">Back to dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
