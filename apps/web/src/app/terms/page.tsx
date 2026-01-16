export default function TermsPage() {
  return (
    <section className="page-section">
      <div className="page-section__inner space-y-10">
        <div className="space-y-4 text-center">
          <p className="eyebrow">Policies</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Terms of Service</h1>
          <p className="mx-auto max-w-2xl text-base text-white/70">
            These sample terms outline expectations for using the Tareeq Al Haqq platform.
          </p>
        </div>
        <div className="glass-panel space-y-6 text-sm text-white/70">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Using our resources</h2>
            <p>
              Access to study materials is provided for personal learning. Please do not redistribute content without permission.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Respectful participation</h2>
            <p>
              Community spaces should remain respectful, focused, and aligned with authentic learning. We may remove harmful content.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Updates</h2>
            <p>
              Terms may be updated to reflect new features or legal requirements. Continued use implies acceptance of changes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
