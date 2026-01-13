import { SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <main className="page-section">
      <div className="page-section__inner flex justify-center">
        <div className="glass-panel w-full max-w-md space-y-6 p-8 text-center text-white">
          <p className="eyebrow">Member access</p>
          <h1 className="text-3xl font-headline uppercase tracking-[0.2em]">Sign in</h1>
          <p className="text-sm text-white/70">Use Clerk to securely access your account.</p>
          <SignInButton>
            <Button className="rounded-full bg-primary px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground">
              Continue to Clerk
            </Button>
          </SignInButton>
        </div>
      </div>
    </main>
  );
}
