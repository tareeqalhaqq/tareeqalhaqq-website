"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuthProfile } from "@/hooks/use-auth-profile";

export default function DashboardMessagesPage() {
  const { status, user } = useAuthProfile();

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-6">
        {status === "loading" && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Messages</p>
            <h1 className="text-3xl font-semibold">Loading your messages</h1>
            <p className="text-sm text-white/70">Checking your account access…</p>
          </div>
        )}
        {status === "unauthenticated" && (
          <div className="glass-panel space-y-3 p-8 text-white">
            <p className="eyebrow">Member access required</p>
            <h1 className="text-3xl font-semibold">Sign in to continue</h1>
            <p className="text-sm text-white/70">Sign in to view your contact updates.</p>
            <Button asChild>
              <Link href="/login">Go to login</Link>
            </Button>
          </div>
        )}
        {status === "authenticated" && (
          <>
            <div className="glass-panel space-y-3 p-8 text-white">
              <p className="eyebrow">Messages</p>
              <h1 className="text-3xl font-semibold">Your contact updates</h1>
              <p className="text-sm text-white/70">
                We send replies to your contact form submissions by email. For privacy and security, your message
                history is delivered directly to {user?.email ?? "your inbox"}.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild>
                  <Link href="/contact">Send a new message</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/user">Back to dashboard</Link>
                </Button>
              </div>
            </div>
            <div className="glass-panel space-y-3 p-8 text-white">
              <h2 className="text-xl font-semibold">What happens next?</h2>
              <ul className="list-disc space-y-2 pl-5 text-sm text-white/70">
                <li>We receive your message instantly in our admin inbox.</li>
                <li>Admins reply and the response is emailed to you directly.</li>
                <li>Keep an eye on your inbox for updates and follow-ups.</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
