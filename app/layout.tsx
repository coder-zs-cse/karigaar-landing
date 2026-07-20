import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  metadataBase: new URL("https://callkaarigar.in"),
  title: "CallKaarigar — Skilled workers on a phone call",
  description:
    "CallKaarigar connects customers in Goa with electricians, plumbers, painters, and other skilled workers by phone. Sankhali, Goa.",
  icons: {
    icon: [
      { url: "/assets/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/assets/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/assets/favicon.ico",
    apple: "/assets/apple-touch-icon.png",
  },
  manifest: "/assets/site.webmanifest",
  robots: { index: true, follow: true },
  openGraph: {
    title: "CallKaarigar",
    description:
      "Phone-first marketplace for skilled home services in Goa. No app required.",
    url: "https://callkaarigar.in",
    siteName: "CallKaarigar",
    images: [{ url: "/assets/web-app-manifest-512x512.png" }],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics />
      <body>{children}</body>
    </html>
  );
}
