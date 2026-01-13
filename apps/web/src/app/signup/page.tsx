export default function Page() {
  return (
    <main className="app-container">
      <div className="main-card-wrapper">
        <h1 className="main-title">Create an account</h1>
        <p className="action-text">Sign up with Auth0 to get started.</p>
        <a href="/auth/login?screen_hint=signup" className="button login">
          Sign Up
        </a>
      </div>
    </main>
  );
}
