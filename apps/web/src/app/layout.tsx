import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import ToasterClient from "@/components/ToasterClient";
import { clerkAuthAppearance } from "@/lib/clerk-appearance";
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
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      appearance={clerkAuthAppearance}
    >
      <html lang="en" className="dark">
        <body className="font-sans antialiased bg-background">
          <ToasterClient />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
