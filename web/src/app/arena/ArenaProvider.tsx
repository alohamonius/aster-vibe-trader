"use client";

import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export function ArenaProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${jetbrainsMono.variable} font-mono`} data-theme="dark">
      <style jsx global>{`
        :root {
          --arena-bg: #0a0a0a;
          --arena-card: #1a1a1a;
          --arena-border: #2a2a2a;
          --arena-text: #e0e0e0;
          --arena-text-dim: #808080;
          --arena-green: #00ff41;
          --arena-red: #ff4136;
          --arena-orange: #ff6b35;
          --arena-purple: #8b5cf6;
          --arena-yellow: #ffb900;

          --chatgpt: #00d084;
          --deepseek: #8b5cf6;
          --claude: #ff6b35;
          --gladiaster: #06b6d4;
        }

        body {
          background: var(--arena-bg);
          color: var(--arena-text);
        }

        /* Hide scrollbar but keep functionality */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: var(--arena-bg);
        }

        ::-webkit-scrollbar-thumb {
          background: var(--arena-border);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #3a3a3a;
        }
      `}</style>
      {children}
    </div>
  );
}
