"use client";

import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Sign In</h1>
      <SignIn />
    </div>
  );
}
