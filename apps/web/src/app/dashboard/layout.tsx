import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUserProfile } from "@/lib/syncUserProfile";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { userId } = auth();

  if (!userId) redirect("/signin");

  await syncUserProfile();

  return children;
}
