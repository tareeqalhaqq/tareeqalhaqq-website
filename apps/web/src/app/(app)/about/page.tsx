import Image from "next/image";
import Link from "next/link";
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
            Tareeq Al Haqq is a platform dedicated to making authentic Islamic knowledge accessible with clarity, context, and trustworthy sourcing. Founded by Mustafa Asif, the initiative pairs verified scholarship with modern technology to create a focused learning experience.
          </p>
        </div>

        {aboutImage && (
          <div className="relative mx-auto aspect-[3/2] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40">
            <Image
              src={aboutImage.imageUrl}
              alt={aboutImage.description}
              data-ai-hint={aboutImage.imageHint}
              fill
              sizes="(min-width: 1024px) 768px, (min-width: 640px) 80vw, 100vw"
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-[0.65rem] uppercase tracking-[0.32em] text-white/70">
                Documenting authentic scholarship in action
              </p>
            </div>
          </div>
        )}

        <div className="glass-panel space-y-8 text-left text-white/80">
          <p>
            Tareeq Al Haqq curates dependable references, commentary, and learning tools so anyone can study the faith with confidence. The team combines traditional scholarship with thoughtful software to keep resources organised and accessible.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {["Our History", "Our Mission", "Our Vision"].map((heading) => (
              <div key={heading} className="rounded-3xl border border-white/10 bg-black/40 p-6 shadow-lg shadow-black/30">
                <h2 className="text-lg font-headline uppercase tracking-[0.2em] text-white">{heading}</h2>
                <p className="mt-3 text-sm text-white/70">
                  {heading === "Our History" &&
                    "Founded to address scattered and unverified resources, the platform began by curating trusted libraries and structuring teacher-approved study plans for contemporary learners."}
                  {heading === "Our Mission" &&
                    "We verify sources, design intuitive study tools, and connect learners with specialists so authentic guidance is easy to access and apply."}
                  {heading === "Our Vision" &&
                    "We are building a global reference point for credible Islamic learning, pairing timeless scholarship with responsible technology."}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 shadow-lg shadow-black/30">
            <h2 className="text-lg font-headline uppercase tracking-[0.2em] text-white">Active Projects</h2>
            <p className="mt-2 text-sm text-white/70">
              Explore the products we are actively building to support authentic Islamic learning.
            </p>
            <Link
              href="/active-projects"
              className="mt-4 inline-flex rounded-full border border-white/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/30 hover:bg-white/10"
            >
              View Active Projects
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
