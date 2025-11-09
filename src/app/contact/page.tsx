import { ContactForm } from "@/components/contact-form";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <section className="page-section">
      <div className="page-section__inner grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-start">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="eyebrow">Connect</p>
            <h1 className="text-4xl uppercase tracking-[0.2em] text-white md:text-5xl">Contact Us</h1>
            <p className="text-base text-white/70">
              Reach out to our team for event enquiries, academy access, or spiritual guidance. Our doors remain open with warmth and sincerity for every seeker.
            </p>
          </div>

          <div className="glass-panel space-y-6 text-white/80">
            <h2 className="text-lg font-headline uppercase tracking-[0.2em] text-white">Get in Touch</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-4">
                <span className="rounded-full border border-white/10 bg-black/50 p-2">
                  <MapPin className="h-5 w-5 text-primary" />
                </span>
                <span>123 Spiritual Path, Knowledge City, 12345</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full border border-white/10 bg-black/50 p-2">
                  <Mail className="h-5 w-5 text-primary" />
                </span>
                <a href="mailto:contact@tareeqalhaqq.org" className="text-primary hover:underline">
                  contact@tareeqalhaqq.org
                </a>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full border border-white/10 bg-black/50 p-2">
                  <Phone className="h-5 w-5 text-primary" />
                </span>
                <span>(123) 456-7890</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 text-sm text-white/70">
            <h3 className="text-base font-headline uppercase tracking-[0.2em] text-white">Visiting Hours</h3>
            <p className="mt-3">Daily: 9:00 AM – 9:00 PM</p>
            <p>Jumu&apos;ah Prayer: 1:00 PM</p>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/50">Please call ahead for special events or holidays.</p>
          </div>
        </div>
        <div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
