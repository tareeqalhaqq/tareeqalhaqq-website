import Link from "next/link";

const footerLinks = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Help", href: "/help" },
];

export default function Footer() {
  return (
    <footer className="px-6 pb-12 pt-24 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-white/30 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Tareeq Al Haqq</p>
          <div className="flex items-center gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-white/60"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="hidden text-white/20 sm:block">
            Seeking knowledge is an obligation upon every Muslim.
          </p>
        </div>
      </div>
    </footer>
  );
}
