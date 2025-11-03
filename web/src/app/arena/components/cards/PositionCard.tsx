'use client';

import type { ArenaPosition } from '@/lib/arenaApi';

interface PositionCardProps {
  position: ArenaPosition;
  agentBalance: number;
  agentColor: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function PositionCard({ position, agentBalance, agentColor, isExpanded, onToggle }: PositionCardProps) {
  const sizePercent = (position.exposure / agentBalance) * 100;
  const marginPercent = position.margin ? (position.margin / agentBalance) * 100 : 0;

  return (
    <div
      className="border-l-2 pl-2 py-1.5 cursor-pointer hover:bg-[var(--arena-border)] transition-colors"
      style={{ borderColor: agentColor }}
      onClick={onToggle}
    >
      {/* Header - Symbol and Side */}
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--arena-text)] font-mono font-semibold text-sm">
            {position.symbol.replace('USDT', '')}
          </span>
          <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${
            position.side === 'LONG'
              ? 'bg-[var(--arena-green)] text-black'
              : 'bg-[var(--arena-red)] text-white'
          }`}>
            {position.side}
          </span>
        </div>
        <span className="text-[9px] text-[var(--arena-text-dim)]">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {/* P&L Display */}
      <div className={`font-mono font-semibold text-sm mb-0.5 ${
        position.unrealizedPnl >= 0 ? 'text-[var(--arena-green)]' : 'text-[var(--arena-red)]'
      }`}>
        {position.unrealizedPnl >= 0 ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
        <span className="text-[10px] ml-1">
          {position.roiPercent >= 0 ? '+' : ''}{position.roiPercent.toFixed(2)}%
        </span>
      </div>

      {!isExpanded && (
        <div className="text-[9px] text-[var(--arena-text-dim)] font-mono">
          Entry: ${position.entryPrice.toFixed(2)} → Current: ${position.markPrice.toFixed(2)}
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2 space-y-1 text-[9px] font-mono" onClick={(e) => e.stopPropagation()}>
          {/* Price */}
          <div className="text-[var(--arena-text)]">
            Entry: <span className="text-[var(--arena-text-dim)]">${position.entryPrice.toFixed(2)}</span>
            {' → '}
            Current: <span className="text-[var(--arena-text-dim)]">${position.markPrice.toFixed(2)}</span>
          </div>

          {/* Size */}
          <div className="text-[var(--arena-text)]">
            Size: <span className="text-[var(--arena-text-dim)]">
              ${position.exposure.toFixed(2)} ({sizePercent.toFixed(2)}%)
            </span>
          </div>

          {/* Margin */}
          {position.margin && (
            <div className="text-[var(--arena-text)]">
              Margin: <span className="text-[var(--arena-text-dim)]">
                ${position.margin.toFixed(2)} ({marginPercent.toFixed(2)}%)
              </span>
            </div>
          )}

          {/* Confidence */}
          {position.confidence && (
            <div className="text-[var(--arena-text)]">
              Confidence: <span className="text-[var(--arena-text-dim)]">
                {position.confidence}%
              </span>
            </div>
          )}

          {/* Leverage */}
          {position.leverage && (
            <div className="text-[var(--arena-text)]">
              Leverage: <span className="text-[var(--arena-text-dim)]">
                {position.leverage}x
              </span>
            </div>
          )}

          {/* Open Time */}
          {position.openTime && (
            <div className="text-[var(--arena-text)]">
              Open @ <span className="text-[var(--arena-text-dim)]">
                {new Date(position.openTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
              </span>
            </div>
          )}

          {/* Reasoning */}
          {position.reasoning && (
            <div className="mt-1.5 pt-1.5 border-t border-[var(--arena-border)]">
              <div className="text-[var(--arena-text-dim)] mb-0.5">Reasoning:</div>
              <div className="text-[var(--arena-text)] leading-relaxed">
                {position.reasoning.length > 150
                  ? `${position.reasoning.slice(0, 150)}...`
                  : position.reasoning
                }
              </div>
            </div>
          )}

          {/* Exit Strategy */}
          {position.exitStrategy && (
            <div className="mt-1.5 pt-1.5 border-t border-[var(--arena-border)]">
              <div className="text-[var(--arena-text-dim)] mb-0.5">Exit Strategy:</div>
              <div className="text-[var(--arena-text)]">
                {position.exitStrategy}
              </div>
            </div>
          )}

          {/* Order IDs */}
          {(position.orderId || position.tpOrderId) && (
            <div className="mt-1.5 pt-1.5 border-t border-[var(--arena-border)] text-[8px] text-[var(--arena-text-dim)]">
              {position.orderId && <div>Order ID: {position.orderId}</div>}
              {position.tpOrderId && <div>TP Order ID: {position.tpOrderId}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
