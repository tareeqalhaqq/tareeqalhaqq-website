export default function HelpPage() {
  return (
    <section className="page-section">
      <div className="page-section__inner space-y-10">
        <div className="space-y-4 text-center">
          <p className="eyebrow">Support</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Need help?</h1>
          <p className="mx-auto max-w-2xl text-base text-white/70">
            We are here to support your learning journey. Use this page to understand how to reach us and what we can assist with.
          </p>
        </div>
        <div className="glass-panel space-y-6 text-sm text-white/70">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Contact options</h2>
            <p>
              Send your questions, feedback, or support requests to our team. We respond during standard business hours.
            </p>
            <p className="text-white/80">Email: support@tareeqalhaqq.org</p>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Community guidelines</h2>
            <p>
              Please keep communications respectful and focused on learning. We aim to provide a calm, supportive space for all seekers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
