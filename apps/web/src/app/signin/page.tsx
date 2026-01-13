import { SignInButton } from '@clerk/nextjs';

export default function Page() {
  return (
    <main className="app-container">
      <div className="main-card-wrapper">
        <h1 className="main-title">Sign in</h1>
        <p className="action-text">Use Clerk to securely access your account.</p>
        <SignInButton>
          <button className="button login">Continue to Clerk</button>
        </SignInButton>
      </div>
    </main>
  );
}
