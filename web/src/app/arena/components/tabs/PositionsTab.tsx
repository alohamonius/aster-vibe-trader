'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { ArenaPosition, ArenaTrade } from '@/lib/arenaApi';
import { PositionCard } from '../cards/PositionCard';
import { TradeCard } from '../cards/TradeCard';

interface PositionsTabProps {
  positions: ArenaPosition[];
  trades?: ArenaTrade[];
  agentBalance: number;
  agentColor: string;
}

export function PositionsTab({ positions, trades = [], agentBalance, agentColor }: PositionsTabProps) {
  const [positionSubTab, setPositionSubTab] = useState<'ACTIVE' | 'PAST'>('ACTIVE');
  const [expandedPosition, setExpandedPosition] = useState<number | null>(null);
  const [expandedTrade, setExpandedTrade] = useState<string | number | null>(null);
  const [newTrades, setNewTrades] = useState<Set<string | number>>(new Set());
  const [droppingTrades, setDroppingTrades] = useState<Set<string | number>>(new Set());
  const previousTradeIds = useRef<Set<string | number>>(new Set());
  const maxVisibleTrades = 5;

  const togglePosition = (idx: number) => {
    // If clicking the currently expanded position, collapse it
    // Otherwise, expand the new one (automatically collapsing the old one)
    setExpandedPosition(prev => prev === idx ? null : idx);
  };

  const toggleTrade = (tradeId: string | number) => {
    // If clicking the currently expanded trade, collapse it
    // Otherwise, expand the new one (automatically collapsing the old one)
    setExpandedTrade(prev => prev === tradeId ? null : tradeId);
  };

  // Sort trades by timestamp (most recent first)
  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => b.timestamp - a.timestamp);
  }, [trades]);

  // Detect new trades and trigger animations
  useEffect(() => {
    const currentTradeIds = new Set(sortedTrades.map(trade => trade.id));
    const newlyArrivedTrades: (string | number)[] = [];

    // Find trades that are in current but not in previous
    currentTradeIds.forEach(tradeId => {
      if (!previousTradeIds.current.has(tradeId)) {
        newlyArrivedTrades.push(tradeId);
      }
    });

    // Add new trades to the animation set
    if (newlyArrivedTrades.length > 0) {
      setNewTrades(prev => {
        const updated = new Set(prev);
        newlyArrivedTrades.forEach(id => updated.add(id));
        return updated;
      });

      // Remove from animation set after 3 seconds
      const timeout = setTimeout(() => {
        setNewTrades(prev => {
          const updated = new Set(prev);
          newlyArrivedTrades.forEach(id => updated.delete(id));
          return updated;
        });
      }, 3000);

      // Update previous trade IDs
      previousTradeIds.current = currentTradeIds;

      return () => clearTimeout(timeout);
    } else {
      // Update previous trade IDs even when no new trades
      previousTradeIds.current = currentTradeIds;
    }
  }, [sortedTrades]);

  // Detect trades that need to be dropped (beyond max visible)
  useEffect(() => {
    if (sortedTrades.length > maxVisibleTrades) {
      // Get trades that should be dropped (index 5 and beyond)
      const tradesToDrop = sortedTrades.slice(maxVisibleTrades).map(t => t.id);

      // Mark them as dropping
      setDroppingTrades(new Set(tradesToDrop));

      // After animation, clear dropping state
      const timeout = setTimeout(() => {
        setDroppingTrades(new Set());
      }, 500);

      return () => clearTimeout(timeout);
    } else {
      setDroppingTrades(new Set());
    }
  }, [sortedTrades, maxVisibleTrades]);

  // Get visible trades (top 5 + any that are dropping)
  const visibleTrades = sortedTrades.filter((trade, idx) => {
    return idx < maxVisibleTrades || droppingTrades.has(trade.id);
  });

  return (
    <div className="space-y-2">
      {/* Position Sub-Tabs */}
      <div className="flex gap-1 border-b border-[var(--arena-border)] pb-1">
        {(['ACTIVE', 'PAST'] as const).map((subTab) => (
          <button
            key={subTab}
            onClick={() => setPositionSubTab(subTab)}
            className={`px-1.5 py-0.5 text-[9px] font-mono transition-colors ${
              positionSubTab === subTab
                ? 'text-[var(--arena-text)] bg-[var(--arena-border)]'
                : 'text-[var(--arena-text-dim)] hover:text-[var(--arena-text)]'
            }`}
          >
            {subTab}
          </button>
        ))}
      </div>

      {/* ACTIVE Sub-Tab - Detailed View */}
      {positionSubTab === 'ACTIVE' && (
        <div className="space-y-2">
          {positions.length > 0 ? (
            positions.map((position, idx) => (
              <PositionCard
                key={idx}
                position={position}
                agentBalance={agentBalance}
                agentColor={agentColor}
                isExpanded={expandedPosition === idx}
                onToggle={() => togglePosition(idx)}
              />
            ))
          ) : (
            <div className="text-[var(--arena-text-dim)] text-xs font-mono italic text-center py-4">
              No open positions
            </div>
          )}
        </div>
      )}

      {/* PAST Sub-Tab - Trade History */}
      {positionSubTab === 'PAST' && (
        <div className="space-y-2">
          {visibleTrades.length > 0 ? (
            visibleTrades.map((trade) => (
              <TradeCard
                key={trade.id}
                trade={trade}
                agentColor={agentColor}
                isExpanded={expandedTrade === trade.id}
                isNew={newTrades.has(trade.id)}
                isDropping={droppingTrades.has(trade.id)}
                onToggle={() => toggleTrade(trade.id)}
              />
            ))
          ) : (
            <div className="text-[var(--arena-text-dim)] text-xs font-mono italic text-center py-4">
              No trades yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
