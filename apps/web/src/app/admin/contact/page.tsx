import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ContactInbox, type ContactMessage } from "@/components/admin/contact-inbox";

const getAdminMessages = async () => {
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

  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return [] satisfies ContactMessage[];
  }

  return (data ?? []) as ContactMessage[];
};

export default async function AdminContactInboxPage() {
  const messages = await getAdminMessages();

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-6">
        <ContactInbox initialMessages={messages} />
      </div>
    </section>
  );
}
