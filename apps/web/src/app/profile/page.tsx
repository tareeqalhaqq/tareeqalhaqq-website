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

export default function ProfilePage() {
  const router = useRouter();
  const { status, user, profile } = useAuthProfile();
  const { toast } = useToast();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setAvatarUrl(profile?.avatar_url ?? '');
  }, [profile?.avatar_url, profile?.full_name]);

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          full_name: fullName.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          email: user.email,
        },
        { onConflict: 'id' },
      );

    if (error) {
      toast({
        title: 'Update failed',
        description: 'We could not update your profile. Please try again.',
        variant: 'destructive',
      });
      setIsSaving(false);
      return;
    }

    toast({
      title: 'Profile updated',
      description: 'Your profile details have been saved.',
    });
    setIsSaving(false);
  };

  if (status === 'loading') {
    return (
      <section className="page-section">
        <div className="page-section__inner">
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Profile</p>
            <h1 className="text-3xl font-semibold">Loading your profile</h1>
            <p className="text-sm text-white/70">Gathering your profile details…</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-6">
        <div className="glass-panel space-y-3 p-8 text-white">
          <p className="eyebrow">Profile</p>
          <h1 className="text-3xl font-semibold">Edit your profile</h1>
          <p className="text-sm text-white/70">Keep your profile details up to date across the academy.</p>
        </div>

        <div className="glass-panel space-y-6 p-8 text-white">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.3em] text-white/70" htmlFor="fullName">
              Full name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
              className="border-white/20 bg-black/40 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.3em] text-white/70" htmlFor="avatarUrl">
              Avatar URL
            </Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://"
              className="border-white/20 bg-black/40 text-white"
            />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            Signed in as <span className="text-white">{user?.email ?? 'Unknown'}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save profile'}
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/user">Back to dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
