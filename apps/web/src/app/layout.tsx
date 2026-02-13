import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return publishableKey ? (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  ) : (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
