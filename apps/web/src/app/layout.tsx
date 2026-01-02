import type { Metadata } from "next";
import ToasterClient from "@/components/ToasterClient";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tareeq Al Haqq",
  description: "Guidance from Mustafa Asif through the circles of Tareeq Al Haqq.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-background">
        <ToasterClient />
        {children}
      </body>
    </html>
  );
}
