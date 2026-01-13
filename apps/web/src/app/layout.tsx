import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAuthAppearance } from "@/lib/clerk-appearance";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tareeq Al Haqq",
  description:
    "A trusted platform delivering authenticated resources, intelligent study tools, and timely updates for seekers of knowledge.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <ClerkProvider appearance={clerkAuthAppearance}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
