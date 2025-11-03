'use client';

import { useState, useEffect } from 'react';
import type { ArenaDecision } from '@/lib/arenaApi';
import { formatTimeAgo } from '../utils/agentCardFormatters';
import { TypingText } from './TypingText';

interface TradingCycle {
  cycleId: string;
  timestamp: string;
  thinkingTime?: number;
  executed: number;
  skipped: number;
  total: number;
  symbols: string[];
  decisions: ArenaDecision[];
}

interface TradingCycleCardProps {
  cycle: TradingCycle;
  agentColor: string;
  isExpanded: boolean;
  isNew?: boolean;
  isDropping?: boolean;
  onToggle: () => void;
}

export function TradingCycleCard({ cycle, agentColor, isExpanded, isNew = false, isDropping = false, onToggle }: TradingCycleCardProps) {
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
      {/* Header - Time and Thinking Stats */}
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-2 text-[10px] text-[var(--arena-text-dim)] font-mono">
          <span>{isExpanded ? '▼' : '▶'}</span>
          <span>{formatTimeAgo(cycle.timestamp, currentTime)}</span>
          {cycle.thinkingTime && (
            <>
              <span>•</span>
              <span>⚡{(cycle.thinkingTime / 1000).toFixed(1)}s</span>
            </>
          )}
        </div>
      </div>

      {/* Symbols as Badges when collapsed */}
      {!isExpanded && (
        <div className="flex flex-wrap gap-1">
          {cycle.symbols.map((symbol) => (
            <div
              key={symbol}
              className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold"
              style={{
                backgroundColor: `${agentColor}15`,
                color: agentColor,
                border: `1px solid ${agentColor}30`
              }}
            >
              {symbol}
            </div>
          ))}
        </div>
      )}

      {/* Expanded: Show all decisions */}
      {isExpanded && (
        <div className="mt-2 space-y-2 text-xs" onClick={(e) => e.stopPropagation()}>
          {cycle.decisions.map((decision, dIdx) => (
            <div key={dIdx} className="pl-2 border-l border-[var(--arena-border)]">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-semibold text-sm text-[var(--arena-text)]">
                  {decision.symbol.replace('USDT', '')}:
                </span>
                <span className={`font-mono font-semibold text-[9px] ${
                  decision.action === 'buy' ? 'text-[var(--arena-green)]' :
                  decision.action === 'sell' ? 'text-[var(--arena-red)]' :
                  'text-[var(--arena-yellow)]'
                }`}>
                  {decision.action.toUpperCase()}
                </span>
                {decision.executed ? (
                  <span className="text-[var(--arena-green)]">✓</span>
                ) : (
                  <span className="text-[var(--arena-text-dim)]">⏭️</span>
                )}
                <span className="text-[9px] text-[var(--arena-text-dim)] font-mono ml-auto">
                  {decision.confidence}%
                </span>
              </div>
              <div className="text-[9px] text-[var(--arena-text-dim)] leading-relaxed">
                <TypingText
                  text={decision.reasoning.length > 120
                    ? `${decision.reasoning.slice(0, 120)}...`
                    : decision.reasoning}
                  speed={25}
                  isActive={isNew && isExpanded}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
