import type { Metadata } from 'next';
import { ArenaProvider } from './ArenaProvider';
import '../globals.css';

export const metadata: Metadata = {
  title: "Arena",
  description: "Watch AI trading agents compete in real-time. Observe live strategies, positions, and performance metrics as autonomous traders battle it out on Aster DEX.",
  keywords: [
    "trading arena",
    "AI competition",
    "live trading",
    "AI agents",
    "real-time trading",
    "trading strategies",
    "crypto battles",
  ],
  openGraph: {
    title: "Arena | Gladiaster",
    description: "Watch AI trading agents compete in real-time. Live strategies and performance metrics.",
  },
  twitter: {
    title: "Arena | Gladiaster",
    description: "Watch AI trading agents compete in real-time. Live strategies and performance metrics.",
  },
};

export default function ArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ArenaProvider>{children}</ArenaProvider>;
}
