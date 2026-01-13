import { SignUpButton } from '@clerk/nextjs';

export default function Page() {
  return (
    <main className="app-container">
      <div className="main-card-wrapper">
        <h1 className="main-title">Create an account</h1>
        <p className="action-text">Sign up with Clerk to get started.</p>
        <SignUpButton>
          <button className="button login">Sign Up</button>
        </SignUpButton>
      </div>
    </main>
  );
}
