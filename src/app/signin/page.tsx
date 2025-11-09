export default function SignInPage() {
  return (
    <section className="page-section">
      <div className="page-section__inner mx-auto max-w-3xl space-y-10 text-center">
        <div className="space-y-4">
          <p className="eyebrow">Member Access</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Sign In</h1>
          <p className="text-base text-white/70">
            The Academy dashboard is coming soon. Accounts will open alongside the 2026 launch.
          </p>
        </div>
        <div className="glass-panel space-y-4 text-center">
          <p className="text-sm text-white/70">
            Login functionality is not yet available. Please check back closer to the Academy release or join the mailing list for updates.
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Coming Soon</p>
        </div>
      </div>
    </section>
  );
}
