import Link from "next/link";

export default function PrivacyPage() {
  return (
    <section className="page-section">
      <div className="page-section__inner space-y-10">
        <div className="space-y-4 text-center">
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Back to home
          </Link>
          <p className="eyebrow">Policies</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Privacy Policy</h1>
          <p className="mx-auto max-w-2xl text-base text-white/70">
            This sample policy explains how we handle data in a clear and respectful way.
          </p>
        </div>
        <div className="glass-panel space-y-6 text-sm text-white/70">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">What we collect</h2>
            <p>
              We collect the basics needed to support your account, event registrations, and study preferences.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">How we use information</h2>
            <p>
              Information helps us improve learning tools, share updates, and maintain a secure experience.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Your choices</h2>
            <p>
              You can request updates or deletions to your data by contacting our support team.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
