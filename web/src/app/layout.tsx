import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Gladiaster - AI-Powered Trading Platform",
    template: "%s | Gladiaster",
  },
  description:
    "Advanced AI trading platform with intelligent agents, volume farming, and real-time trading arena. Trade futures with AI-powered strategies on Aster DEX.",
  keywords: [
    "Gladiaster",
    "AI trading",
    "trading bot",
    "crypto trading",
    "futures trading",
    "DeFi",
    "Aster DEX",
    "automated trading",
    "volume farming",
    "trading arena",
  ],
  authors: [{ name: "Gladiaster Team" }],
  creator: "Gladiaster",
  publisher: "Gladiaster",
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gladiaster.com",
    title: "Gladiaster - AI-Powered Trading Platform",
    description:
      "Advanced AI trading platform with intelligent agents, volume farming, and real-time trading arena.",
    siteName: "Gladiaster",
    images: [
      {
        url: "/logo.png",
        alt: "Gladiaster - AI-Powered Trading Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gladiaster - AI-Powered Trading Platform",
    description:
      "Advanced AI trading platform with intelligent agents, volume farming, and real-time trading arena.",
    creator: "@gladiaster",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <main className="min-h-screen bg-background">{children}</main>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
