import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ContactMessageView } from "@/components/admin/contact-message-view";
import type { ContactMessage } from "@/components/admin/contact-inbox";

type AdminContactMessagePageProps = {
  params: { id: string };
};

const getMessage = async (messageId: string) => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("app_role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.app_role !== "admin") {
    redirect("/dashboard");
  }

  const { data } = await supabase.from("contact_messages").select("*").eq("id", messageId).maybeSingle();

  return data as ContactMessage | null;
};

export default async function AdminContactMessagePage({ params }: AdminContactMessagePageProps) {
  const message = await getMessage(params.id);

  if (!message) {
    notFound();
  }

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-6">
        <ContactMessageView message={message} />
      </div>
    </section>
  );
}
