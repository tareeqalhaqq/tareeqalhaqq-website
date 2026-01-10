"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signup } from "@/lib/auth";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSignup = async () => {
    const res = await signup(email, password);
    if (res.success) setMsg("Signup successful! Check your email to confirm your account.");
    else setMsg(res.error ?? "Signup failed");
  };

  return (
    <section className="page-section">
      <div className="page-section__inner mx-auto max-w-2xl space-y-8">
        <div className="space-y-3 text-center">
          <p className="eyebrow">New to the Academy</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white">Create your account</h1>
          <p className="text-sm text-white/70">
            Begin your journey with Tareeq Al Haqq. Register below to access lessons, community updates, and your
            personal dashboard.
          </p>
        </div>
        <div className="glass-panel space-y-6 p-8 text-white">
          <div className="space-y-4">
            <label className="space-y-2 text-sm font-medium">
              Email
              <Input
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Password
              <Input
                placeholder="Create a password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>
          </div>

          <div className="space-y-3">
            <Button onClick={handleSignup} className="w-full">
              Sign Up
            </Button>
            <p className="text-center text-xs text-white/60">
              Already have an account?{" "}
              <Link className="text-white underline-offset-4 hover:underline" href="/signin">
                Sign in here
              </Link>
            </p>
            {msg && <p className="text-sm text-emerald-200">{msg}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
