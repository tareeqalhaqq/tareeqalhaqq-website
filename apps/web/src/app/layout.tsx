
import type { Metadata } from 'next';
import dynamic from "next/dynamic";
import "./globals.css";

const Toaster = dynamic(
  () => import("@/components/ui/toaster").then((mod) => mod.Toaster),
  { ssr: false }
);


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
