import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ClerkConfigProvider } from "@/components/providers/clerk-config-provider";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: "/images/logo.ico",
    shortcut: "/images/logo.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? process.env.CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = Boolean(publishableKey);

  return (
    <html lang="en">
      <body>
        <ClerkConfigProvider isClerkConfigured={isClerkConfigured}>
          {isClerkConfigured && publishableKey ? (
            <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>
          ) : (
            children
          )}
        </ClerkConfigProvider>
      </body>
    </html>
  );
}
