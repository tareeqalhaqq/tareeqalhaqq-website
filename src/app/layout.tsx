
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const fontHeadline = FontDisplay({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});


export const metadata: Metadata = {
  title: 'Tareeq Al Haqq',
  description: 'Guidance from Mustafa Asif through the circles of Tareeq Al Haqq.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
