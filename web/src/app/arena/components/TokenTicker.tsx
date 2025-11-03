'use client';

import { useEffect, useRef } from 'react';
import type { MarketPrice } from '@/lib/arenaApi';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TokenTickerProps {
  prices: MarketPrice[];
}

export function TokenTicker({ prices }: TokenTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    let scrollPosition = 0;
    const scroll = () => {
      scrollPosition += 0.5;
      if (scrollPosition >= scrollElement.scrollWidth / 2) {
        scrollPosition = 0;
      }
      scrollElement.scrollLeft = scrollPosition;
    };

    const interval = setInterval(scroll, 50);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className="bg-[#0a0a0a] border-t border-[var(--arena-border)]">
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-hidden py-3 px-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Duplicate for seamless loop */}
        {[...prices, ...prices].map((token, idx) => (
          <div
            key={`${token.symbol}-${idx}`}
            className="flex items-center gap-3 whitespace-nowrap"
          >
            <div className="flex items-center gap-2">
              <span className="text-[var(--arena-yellow)] font-bold text-sm">
                {token.name}
              </span>
              <span className="text-[var(--arena-text)] font-mono text-base font-semibold">
                ${formatPrice(token.price)}
              </span>
            </div>

            <div className={`flex items-center gap-1 text-sm ${
              token.changePercent24h >= 0
                ? 'text-[var(--arena-green)]'
                : 'text-[var(--arena-red)]'
            }`}>
              {token.changePercent24h >= 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span className="font-mono font-semibold">
                {formatChange(token.changePercent24h)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
