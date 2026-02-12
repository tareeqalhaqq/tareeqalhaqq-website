'use client';

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useAuthProfile } from '@/hooks/use-auth-profile';

const EXPO_WEB_URL =
  process.env.NEXT_PUBLIC_EXPO_WEB_URL || 'http://localhost:8081';
const EXPO_ORIGIN = new URL(EXPO_WEB_URL).origin;

export const dynamic = 'force-dynamic';

export default function MobileBridgePage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [allowed, setAllowed] = useState(false);
  const { status, isAdmin } = useAuthProfile();
  const { getToken, isSignedIn, userId } = useAuth();
  const [supabaseToken, setSupabaseToken] = useState<string | null>(null);

  const sendSession = async () => {
    if (!supabaseToken || !userId) return;
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'SUPABASE_SESSION',
        session: {
          access_token: supabaseToken,
          refresh_token: null,
          user_id: userId,
        },
      },
      EXPO_ORIGIN
    );
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/sign-in');
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
    let isMounted = true;
    if (!isSignedIn) {
      setSupabaseToken(null);
      return () => {
        isMounted = false;
      };
    }
    getToken()
      .then((token) => {
        if (isMounted) {
          setSupabaseToken(token ?? null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSupabaseToken(null);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (!supabaseToken) return;
    void sendSession();
  }, [supabaseToken, userId]);

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

      </div>
    </main>
  );
}
