'use client';

import { useEffect, useMemo, useRef } from 'react';
import { createClient } from '@/utils/supabase/clients';

const EXPO_WEB_URL =
  process.env.NEXT_PUBLIC_EXPO_WEB_URL || 'http://localhost:8081';
const EXPO_ORIGIN = new URL(EXPO_WEB_URL).origin;

export default function MobileBridgePage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const sendSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'SUPABASE_SESSION',
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        },
      },
      EXPO_ORIGIN
    );
  };

  useEffect(() => {
    let mounted = true;

    const sendIfMounted = async () => {
      if (!mounted) return;
      await sendSession();
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      sendIfMounted();
    });

    sendIfMounted();

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

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
