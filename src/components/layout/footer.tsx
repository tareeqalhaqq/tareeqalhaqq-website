
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
    <footer className="bg-card border-t">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo />
            <p className="text-muted-foreground text-sm">
              A spiritual path rooted in the teachings of the Quran and Sunnah.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  {link.href ? (
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">{link.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Contact</h3>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>123 Spiritual Path, Knowledge City, 12345</p>
              <p>Email: contact@rahmaniyyah.com</p>
              <p>Phone: (123) 456-7890</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Follow Us</h3>
            <div className="flex mt-4 space-x-4">
              {socialLinks.map((social) => {
                const Icon = iconMap[social.icon as keyof typeof iconMap];
                return (
                  <Link key={social.name} href={social.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {Icon && <Icon className="h-6 w-6" />}
                    <span className="sr-only">{social.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Tareeq Al Haqq. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
