
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";


export const metadata: Metadata = {
  title: 'Tareeq Al Haqq',
  description: 'The Path to Knowledge with Mustafa Asif and Tareeq Al Haqq',
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
