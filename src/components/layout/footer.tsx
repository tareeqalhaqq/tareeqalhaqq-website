
import Link from "next/link";
import { Logo } from "@/components/icons";
import { socialLinks, navLinks } from "@/lib/data";
import { Facebook, Twitter, Youtube, Instagram } from "lucide-react";

const iconMap = {
  Facebook: Facebook,
  Twitter: Twitter,
  Youtube: Youtube,
  Instagram: Instagram,
};

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/70 text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-6">
            <Logo />
            <p className="max-w-sm text-sm text-white/70">
              A trusted platform delivering authenticated resources, intelligent study tools, and timely updates for seekers of knowledge.
            </p>
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/40">
              <span className="h-px flex-1 bg-white/20" />
              Authentic Knowledge Tools
              <span className="h-px flex-1 bg-white/20" />
            </div>
          </div>
          <div className="grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-1">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Quick Links</h3>
              <ul className="mt-4 space-y-3">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        className="text-white/60 transition hover:text-primary"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <span className="text-white/40">{link.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Contact</h3>
              <div className="mt-4 space-y-2 text-white/60">
                <p>123 Spiritual Path, Knowledge City, 12345</p>
                <p>contact@tareeqalhaqq.org</p>
                <p>(123) 456-7890</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Follow Us</h3>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = iconMap[social.icon as keyof typeof iconMap];
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-primary/60 hover:text-primary"
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    <span className="sr-only">{social.name}</span>
                  </Link>
                );
              })}
            </div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">Stay connected to verified learning</p>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs uppercase tracking-[0.3em] text-white/40">
          &copy; {new Date().getFullYear()} Tareeq Al Haqq. All rights reserved.
        </div>
      </div>
    </footer>
  );
}