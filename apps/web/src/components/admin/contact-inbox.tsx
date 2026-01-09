"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuthProfile } from "@/hooks/use-auth-profile";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ContactMessage = {
  id: string;
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  status: string | null;
  created_at: string;
  admin_reply: string | null;
  replied_at: string | null;
  archived?: boolean | null;
};

type ContactInboxProps = {
  initialMessages: ContactMessage[];
};

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export function ContactInbox({ initialMessages }: ContactInboxProps) {
  const router = useRouter();
  const { status, profile } = useAuthProfile();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const isAdmin = profile?.app_role === "admin";
  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAdmin, router, status]);

  const visibleMessages = useMemo(
    () => messages.filter((message) => !message.archived),
    [messages]
  );

  const handleArchive = async (messageId: string) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ archived: true })
      .eq("id", messageId);

    if (error) {
      toast({
        title: "Archive failed",
        description: "We could not archive this message. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId ? { ...message, archived: true } : message
      )
    );
  };

  if (status === "loading") {
    return (
      <div className="glass-panel space-y-3 p-8 text-white">
        <p className="eyebrow">Admin Inbox</p>
        <h1 className="text-3xl font-semibold">Preparing contact messages</h1>
        <p className="text-sm text-white/70">Checking permissions and loading messages…</p>
      </div>
    );
  }

  if (status === "authenticated" && !isAdmin) {
    return (
      <div className="glass-panel space-y-3 p-8 text-white">
        <p className="eyebrow">Access restricted</p>
        <h1 className="text-3xl font-semibold">Admin permissions required</h1>
        <p className="text-sm text-white/70">Only administrators can access contact messages.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel space-y-3 p-8 text-white">
        <p className="eyebrow">Admin Inbox</p>
        <h1 className="text-3xl font-semibold">Contact messages</h1>
        <p className="text-sm text-white/70">
          Review incoming contact requests and send replies directly from the dashboard.
        </p>
      </div>
      <div className="glass-panel divide-y divide-white/10 text-white">
        {visibleMessages.length === 0 && (
          <div className="p-8 text-sm text-white/70">No contact messages yet.</div>
        )}
        {visibleMessages.map((message) => (
          <div key={message.id} className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-lg font-semibold">{message.subject || "No subject"}</p>
              <p className="text-sm text-white/70">
                {message.name ?? "Unknown"} · {message.email ?? "No email"}
              </p>
              <p className="text-xs text-white/50">Received {formatDate(message.created_at)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                  message.status === "replied"
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "bg-amber-500/20 text-amber-200"
                }`}
              >
                {message.status === "replied" ? "Replied" : "Unread"}
              </span>
              <Button asChild variant="outline">
                <Link href={`/admin/contact/${message.id}`}>View / Reply</Link>
              </Button>
              {typeof message.archived === "boolean" && !message.archived && (
                <Button variant="ghost" onClick={() => handleArchive(message.id)}>
                  Archive
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
