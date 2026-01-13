import { SignInButton, SignOutButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Profile from '@/components/Profile';

export default function Home() {
  return (
    <div className="app-container">
      <div className="main-card-wrapper">
        <h1 className="main-title">Next.js + Clerk</h1>

        <div className="action-card">
          <SignedIn>
            <div className="logged-in-section">
              <p className="logged-in-message">✅ Successfully logged in!</p>
              <Profile />
              <SignOutButton>
                <button className="button logout">Log Out</button>
              </SignOutButton>
            </div>
          </SignedIn>
          <SignedOut>
            <p className="action-text">
              Welcome! Please log in to access your protected content.
            </p>
            <SignInButton>
              <button className="button login">Log In</button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </div>
  );
}
