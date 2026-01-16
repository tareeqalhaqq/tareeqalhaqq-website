
import Link from "next/link";
import { Logo } from "@/components/icons";

const footerLinks = [
  { label: "Need help?", href: "/help" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="px-4 pb-16 pt-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="glass-panel flex flex-col gap-8 border-white/10 bg-slate-900/70 px-8 py-10 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <Logo className="text-white" />
            <p className="text-xs text-white/60">
              &copy; {new Date().getFullYear()} Tareeq Al Haqq. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col gap-4 text-xs text-white/70 md:items-end">
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-white/80">
              {footerLinks.map((link, index) => (
                <span key={link.label} className="flex items-center gap-3">
                  <Link href={link.href} className="transition hover:text-primary">
                    {link.label}
                  </Link>
                  {index !== footerLinks.length - 1 && <span className="h-4 w-px bg-white/20" aria-hidden />}
                </span>
              ))}
            </div>
            <p className="text-xs text-white/60">
              Seeking knowledge is an obligation upon every Muslim.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
