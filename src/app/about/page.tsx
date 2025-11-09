
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
            Tareeq Al Haqq is a neutral platform dedicated to making authentic Islamic knowledge accessible with clarity, context, and trustworthy sourcing.
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
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">Documenting authentic scholarship in action</p>
            </div>
          </div>
        )}

        <div className="glass-panel space-y-8 text-left text-white/80">
          <p>
            Built by researchers, editors, and teachers, Tareeq Al Haqq curates dependable references, commentary, and learning experiences so anyone can explore the faith with confidence.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {["Our History", "Our Mission", "Our Vision"].map((heading) => (
              <div key={heading} className="rounded-3xl border border-white/10 bg-black/40 p-6 shadow-lg shadow-black/30">
                <h2 className="text-lg font-headline uppercase tracking-[0.2em] text-white">{heading}</h2>
                <p className="mt-3 text-sm text-white/70">
                  {heading === "Our History" &&
                    "Founded as a response to scattered resources, the platform began by digitising trusted libraries and recording teacher-approved study plans for contemporary students."}
                  {heading === "Our Mission" &&
                    "We verify sources, design intuitive study tools, and connect learners with specialists so authentic guidance is easy to access and apply."}
                  {heading === "Our Vision" &&
                    "We are building a global reference point for credible Islamic learning, pairing timeless scholarship with responsible technology."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
