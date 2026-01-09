import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";

type ReplyPayload = {
  messageId: string;
  replyText: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as ReplyPayload;

  if (!payload?.messageId || !payload?.replyText?.trim()) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("app_role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.app_role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: message, error: messageError } = await supabase
    .from("contact_messages")
    .select("id, email")
    .eq("id", payload.messageId)
    .maybeSingle();

  if (messageError || !message) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }

  const replyText = payload.replyText.trim();
  const { error: updateError } = await supabase
    .from("contact_messages")
    .update({
      admin_reply: replyText,
      status: "replied",
      replied_at: new Date().toISOString(),
    })
    .eq("id", payload.messageId);

  if (updateError) {
    return NextResponse.json({ error: "Unable to save reply." }, { status: 500 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey || !resendFrom) {
    return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
  }

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFrom,
      to: message.email,
      subject: "Reply from Tareeq al Haqq",
      text: replyText,
    }),
  });

  if (!emailResponse.ok) {
    return NextResponse.json({ error: "Unable to send email reply." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
