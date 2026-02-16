import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { label: "Need help?", href: "/help" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="px-6 pb-12 pt-24 sm:px-8">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-[#9dc0df]/25 bg-[linear-gradient(180deg,rgba(83,124,154,0.24)_0%,rgba(38,65,89,0.26)_100%)] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.26),0_0_34px_rgba(148,197,255,0.08)] [backdrop-filter:blur(26px)_saturate(160%)] sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(103,232,249,0.14),transparent_40%)]" />

        <div className="relative">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                <Image
                  src="/images/logo-mark.svg"
                  alt="Tareeq Al Haqq mark"
                  width={42}
                  height={42}
                  className="opacity-90"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                  Tareeq Al Haqq
                </p>
                <p className="text-lg font-semibold text-white/90">
                  Authentic Islamic Learning
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
              {footerLinks.map((link, index) => (
                <div key={link.label} className="flex items-center gap-3">
                  {index > 0 && <span className="text-white/30">|</span>}
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="my-7 h-px bg-white/10" />

          <div className="flex flex-col gap-3 text-sm text-white/65 sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} Tareeq Al Haqq. All rights
              reserved.
            </p>
            <p className="text-white/70">
              Seeking knowledge is an obligation upon every Muslim.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
