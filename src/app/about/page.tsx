
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find((p) => p.id === "about-main");

  return (
    <section className="page-section">
      <div className="page-section__inner space-y-12">
        <div className="space-y-4 text-center">
          <p className="eyebrow">Our Heritage</p>
          <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">About Tareeq Al Haqq</h1>
          <p className="mx-auto max-w-3xl text-base text-white/70">
            Inspired by Rahmaniyyah&apos;s timeless path, Tareeq Al Haqq guides seekers through a balanced cultivation of knowledge, remembrance, and service.
          </p>
        </div>

        {aboutImage && (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40">
            <Image
              src={aboutImage.imageUrl}
              alt={aboutImage.description}
              data-ai-hint={aboutImage.imageHint}
              width={1200}
              height={800}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">Rahmaniyyah Inspired Retreat</p>
            </div>
          </div>
        )}

        <div className="glass-panel space-y-8 text-left text-white/80">
          <p>
            Al-Tariqa Al-Rahmaniyyah is a distinguished spiritual order founded upon the principles of the Quran and the Sunnah of Prophet Muhammad (peace be upon him). Our path emphasizes the purification of the soul (tazkiyat al-nafs), the attainment of spiritual excellence (ihsan), and a profound, living connection with Allah.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {["Our History", "Our Mission", "Our Vision"].map((heading) => (
              <div key={heading} className="rounded-3xl border border-white/10 bg-black/40 p-6 shadow-lg shadow-black/30">
                <h2 className="text-lg font-headline uppercase tracking-[0.2em] text-white">{heading}</h2>
                <p className="mt-3 text-sm text-white/70">
                  {heading === "Our History" &&
                    "The Rahmaniyyah path traces its lineage back through an unbroken chain of esteemed scholars and saints to the Prophet himself. It was formally established to preserve and transmit the esoteric sciences of Islam, providing a structured methodology for seekers to progress toward the Divine."}
                  {heading === "Our Mission" &&
                    "We cultivate a nurturing environment where seekers deepen their spiritual understanding, refine their character, and serve humanity. Through carefully curated programmes we offer guidance grounded in tradition and relevant to the modern seeker."}
                  {heading === "Our Vision" &&
                    "We envision a world illuminated by Prophetic mercy. Through community outreach and transformative gatherings we aspire to embody a living legacy of compassion, knowledge, and service."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
