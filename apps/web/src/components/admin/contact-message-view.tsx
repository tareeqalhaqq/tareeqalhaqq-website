"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthProfile } from "@/hooks/use-auth-profile";
import { useToast } from "@/hooks/use-toast";
import type { ContactMessage } from "@/components/admin/contact-inbox";

type ContactMessageViewProps = {
  message: ContactMessage;
};

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export function ContactMessageView({ message }: ContactMessageViewProps) {
  const router = useRouter();
  const { status, profile } = useAuthProfile();
  const { toast } = useToast();
  const isAdmin = profile?.app_role === "admin";
  const [replyText, setReplyText] = useState(message.admin_reply ?? "");
  const [isSending, setIsSending] = useState(false);

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

  const canReply = useMemo(() => replyText.trim().length > 0 && !isSending, [replyText, isSending]);

  const handleSendReply = async () => {
    if (!canReply) return;
    setIsSending(true);
    try {
      const response = await fetch("/api/contact/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: message.id, replyText: replyText.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reply.");
      }

      toast({
        title: "Reply sent",
        description: "The reply has been saved and emailed to the sender.",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Reply failed",
        description: "We could not send the reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="glass-panel space-y-3 p-8 text-white">
        <p className="eyebrow">Contact Message</p>
        <h1 className="text-3xl font-semibold">Loading message</h1>
        <p className="text-sm text-white/70">Preparing details…</p>
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
          <a href="/dashboard">Back to dashboard</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel space-y-3 p-8 text-white">
        <p className="eyebrow">Contact Message</p>
        <h1 className="text-3xl font-semibold">{message.subject || "No subject provided"}</h1>
        <div className="text-sm text-white/70">
          <p>{message.name ?? "Unknown sender"}</p>
          <p>{message.email ?? "No email provided"}</p>
          <p>Received {formatDate(message.created_at)}</p>
        </div>
      </div>

      <div className="glass-panel space-y-4 p-8 text-white">
        <h2 className="text-xl font-semibold">Message</h2>
        <p className="whitespace-pre-wrap text-sm text-white/80">{message.message ?? "No message body provided."}</p>
      </div>

      {message.admin_reply && (
        <div className="glass-panel space-y-3 p-8 text-white">
          <h2 className="text-xl font-semibold">Previous Reply</h2>
          <p className="whitespace-pre-wrap text-sm text-white/80">{message.admin_reply}</p>
          {message.replied_at && (
            <p className="text-xs text-white/50">Replied {formatDate(message.replied_at)}</p>
          )}
        </div>
      )}

      <div className="glass-panel space-y-4 p-8 text-white">
        <h2 className="text-xl font-semibold">Reply to sender</h2>
        <Textarea
          value={replyText}
          onChange={(event) => setReplyText(event.target.value)}
          className="min-h-[160px] border-white/20 bg-black/40 text-white"
          placeholder="Write your reply here..."
        />
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSendReply} disabled={!canReply}>
            {isSending ? "Sending..." : "Send Reply"}
          </Button>
          <Button variant="outline" asChild>
            <a href="/admin/contact">Back to inbox</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
