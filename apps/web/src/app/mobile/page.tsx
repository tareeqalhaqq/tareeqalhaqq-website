'use client';

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useAuthProfile } from '@/hooks/use-auth-profile';

const EXPO_WEB_URL =
  process.env.NEXT_PUBLIC_EXPO_WEB_URL || 'http://localhost:8081';
const EXPO_ORIGIN = new URL(EXPO_WEB_URL).origin;

export default function MobileBridgePage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [allowed, setAllowed] = useState(false);
  const { status, isAdmin } = useAuthProfile();
  const { user, isLoaded } = useUser();

  const sendSession = async () => {
    if (!user?.id) return;
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'SUPABASE_SESSION',
        session: {
          access_token: null,
          refresh_token: null,
          user_id: user.id,
        },
      },
      EXPO_ORIGIN
    );
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/signin');
      return;
    }
    if (status === 'authenticated' && isAdmin) {
      router.replace('/dashboard/admin');
      return;
    }
    if (status === 'authenticated' && !isAdmin) {
      setAllowed(true);
    }
  }, [isAdmin, router, status]);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    void sendSession();
  }, [isLoaded, user?.id]);

  if (!allowed) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
        <div className="space-y-2">
          <p className="eyebrow">Tareeq Al Haqq App</p>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            Open the mobile app on web
          </h1>
          <p className="text-sm text-white/70">
            You&apos;re authenticated. We load the Expo-powered experience
            directly in your browser.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
          <iframe
            ref={iframeRef}
            src={EXPO_WEB_URL}
            title="Tareeq Al Haqq Mobile App"
            className="h-[78vh] w-full"
            onLoad={sendSession}
          />
        </div>

        <p className="text-xs text-white/50">
          If the app does not appear, start the Expo web server locally with
          <code className="mx-1 rounded bg-white/10 px-2 py-1">npm --workspace apps/tareeqalhaqq-mobile run web</code>
          or set <code className="mx-1 rounded bg-white/10 px-2 py-1">NEXT_PUBLIC_EXPO_WEB_URL</code> to your deployed Expo
          web URL.
        </p>
      </div>
    </main>
  );
}
