'use client';

import { useState, useEffect } from 'react';
import type { ArenaTrade } from '@/lib/arenaApi';
import { formatTimeAgo } from '../utils/agentCardFormatters';

interface TradeCardProps {
  trade: ArenaTrade;
  agentColor: string;
  isExpanded: boolean;
  isNew?: boolean;
  isDropping?: boolean;
  onToggle: () => void;
}

export function TradeCard({ trade, agentColor, isExpanded, isNew = false, isDropping = false, onToggle }: TradeCardProps) {
  // Real-time timer state
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Build animation classes
  const animationClasses = [
    isNew ? 'thinking-cycle-enter thinking-cycle-glow thinking-cycle-glitch thinking-cycle-scan' : '',
    isDropping ? 'thinking-cycle-drop' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={`border-l-2 pl-2 py-1.5 cursor-pointer hover:bg-[var(--arena-border)] transition-colors ${animationClasses}`}
      style={{
        borderColor: agentColor,
        color: agentColor // Used by animation for glow color
      }}
      onClick={onToggle}
    >
      {/* Header - Symbol and Side */}
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--arena-text)] font-mono font-semibold text-sm">
            {trade.symbol.replace('USDT', '')}
          </span>
          <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${
            trade.side === 'BUY'
              ? 'bg-[var(--arena-green)] text-black'
              : 'bg-[var(--arena-red)] text-white'
          }`}>
            {trade.side}
          </span>
        </div>
        <span className="text-[9px] text-[var(--arena-text-dim)]">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {/* Value Display */}
      <div className="font-mono font-semibold text-sm mb-0.5 text-[var(--arena-text)]">
        ${trade.value.toFixed(2)}
        <span className="text-[10px] ml-1 text-[var(--arena-text-dim)]">
          {formatTimeAgo(trade.timestamp, currentTime)}
        </span>
      </div>

      {!isExpanded && (
        <div className="text-[9px] text-[var(--arena-text-dim)] font-mono">
          {trade.quantity.toFixed(4)} @ ${trade.price.toFixed(2)}
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2 space-y-1 text-[9px] font-mono" onClick={(e) => e.stopPropagation()}>
          {/* Price */}
          <div className="text-[var(--arena-text)]">
            Price: <span className="text-[var(--arena-text-dim)]">${trade.price.toFixed(2)}</span>
          </div>

          {/* Quantity */}
          <div className="text-[var(--arena-text)]">
            Quantity: <span className="text-[var(--arena-text-dim)]">
              {trade.quantity.toFixed(4)}
            </span>
          </div>

          {/* Commission */}
          <div className="text-[var(--arena-text)]">
            Commission: <span className="text-[var(--arena-text-dim)]">
              ${trade.commission.toFixed(2)}
            </span>
          </div>

          {/* Trade Time */}
          <div className="text-[var(--arena-text)]">
            Time: <span className="text-[var(--arena-text-dim)]">
              {new Date(trade.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })}
            </span>
          </div>

          {/* Trade ID */}
          {trade.id && (
            <div className="mt-1.5 pt-1.5 border-t border-[var(--arena-border)] text-[8px] text-[var(--arena-text-dim)]">
              Trade ID: {trade.id}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
