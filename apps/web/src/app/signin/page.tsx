export default function Page() {
  return (
    <main className="app-container">
      <div className="main-card-wrapper">
        <h1 className="main-title">Sign in</h1>
        <p className="action-text">Use Auth0 to securely access your account.</p>
        <a href="/auth/login" className="button login">
          Continue to Auth0
        </a>
      </div>
    </main>
  );
}
