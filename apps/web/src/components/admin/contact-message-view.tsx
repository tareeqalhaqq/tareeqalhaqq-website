"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthProfile } from "@/hooks/use-auth-profile";
import { useToast } from "@/hooks/use-toast";
import type { ContactMessage } from "@/components/admin/contact-inbox";
import { createBrowserClient } from "@/lib/supabase/client";

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
  const supabase = useMemo(() => createBrowserClient(), []);
  const [adminReply, setAdminReply] = useState(message.admin_reply ?? "");
  const [repliedAt, setRepliedAt] = useState(message.replied_at ?? null);
  const [replyStatus, setReplyStatus] = useState(message.status ?? "unread");
  const [replyText, setReplyText] = useState(message.admin_reply ?? "");
  const [isSending, setIsSending] = useState(false);
  const hasReplied = Boolean(adminReply);

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

  const canReply = useMemo(
    () => replyText.trim().length > 0 && !isSending && !hasReplied,
    [hasReplied, isSending, replyText]
  );

  const handleSendReply = async () => {
    if (!canReply) return;
    setIsSending(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("app_role")
        .single();

      if (profileError) {
        console.error("Reply failed:", profileError.message);
        throw new Error("Unable to verify admin access.");
      }

      if (profileData?.app_role !== "admin") {
        throw new Error("Unauthorized");
      }

      const replyTimestamp = new Date().toISOString();
      const { error } = await supabase
        .from("contact_messages")
        .update({
          admin_reply: replyText.trim(),
          status: "replied",
          replied_at: replyTimestamp,
        })
        .eq("id", message.id);

      if (error) {
        console.error("Reply failed:", error.message);
        throw new Error("Failed to send reply.");
      }

      setAdminReply(replyText.trim());
      setRepliedAt(replyTimestamp);
      setReplyStatus("replied");
      toast({
        title: "Reply saved",
        description: "The reply has been saved to the contact thread.",
      });
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

      {adminReply && (
        <div className="glass-panel space-y-3 p-8 text-white">
          <h2 className="text-xl font-semibold">Previous Reply</h2>
          <p className="whitespace-pre-wrap text-sm text-white/80">{adminReply}</p>
          {repliedAt && (
            <p className="text-xs text-white/50">Replied {formatDate(repliedAt)}</p>
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
            {hasReplied ? "Reply saved" : isSending ? "Sending..." : "Send Reply"}
          </Button>
          <Button variant="outline" asChild>
            <a href="/admin/contact">Back to inbox</a>
          </Button>
        </div>
        {replyStatus === "replied" && repliedAt && (
          <p className="text-xs text-white/60">Status updated to replied on {formatDate(repliedAt)}.</p>
        )}
      </div>
    </div>
  );
}
