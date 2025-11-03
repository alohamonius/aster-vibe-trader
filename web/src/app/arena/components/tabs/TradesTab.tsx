'use client';

import type { ArenaTrade } from '@/lib/arenaApi';
import { formatTime } from '../utils/agentCardFormatters';

interface TradesTabProps {
  trades: ArenaTrade[];
  agentColor: string;
}

export function TradesTab({ trades, agentColor }: TradesTabProps) {
  return (
    <div className="space-y-2">
      {trades.length > 0 ? (
        trades.map((trade, idx) => (
          <div
            key={idx}
            className="text-xs border-l-2 pl-2 py-1"
            style={{ borderColor: agentColor }}
          >
            <div className="text-[var(--arena-text-dim)] font-mono mb-1">
              {formatTime(trade.timestamp)}
            </div>
            <div className={`font-mono ${
              trade.side === 'BUY' ? 'text-[var(--arena-green)]' : 'text-[var(--arena-red)]'
            }`}>
              {trade.action.toUpperCase()} {trade.quantity.toFixed(4)} {trade.symbol.replace('USDT', '')}
            </div>
            <div className="text-[var(--arena-text-dim)] font-mono">
              @ ${trade.price.toFixed(2)}
            </div>
          </div>
        ))
      ) : (
        <div className="text-[var(--arena-text-dim)] text-xs font-mono italic text-center py-4">
          No recent trades
        </div>
      )}
    </div>
  );
}
