'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { ArenaDecision } from '@/lib/arenaApi';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ThinkingTabProps {
  decisions: ArenaDecision[];
  agentColor: string;
}

export function ThinkingTab({ decisions, agentColor }: ThinkingTabProps) {
  const [expandedCycles, setExpandedCycles] = useState<Set<string>>(new Set());
  const [newCycles, setNewCycles] = useState<Set<string>>(new Set());
  const [droppingCycles, setDroppingCycles] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(Date.now());
  const previousCycleIds = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);
  const maxVisibleCycles = 10;

  // Update timer every second for relative time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Group decisions by trading cycle
  const tradingCycles = useMemo(() => {
    const cycleMap = new Map<string, ArenaDecision[]>();

    decisions.forEach(decision => {
      const cycleId = decision.tradingCycleId || 'no-cycle';
      if (!cycleMap.has(cycleId)) {
        cycleMap.set(cycleId, []);
      }
      cycleMap.get(cycleId)!.push(decision);
    });

    return Array.from(cycleMap.entries())
      .filter(([id]) => id !== 'no-cycle')
      .map(([cycleId, cycleDecisions]) => {
        const executed = cycleDecisions.filter(d => d.executed).length;
        const skipped = cycleDecisions.length - executed;
        const timestamp = cycleDecisions[0]?.timestamp;
        const thinkingTime = cycleDecisions[0]?.llmStats?.executionTime;

        // Count decisions per symbol
        const symbolCounts = new Map<string, number>();
        cycleDecisions.forEach(d => {
          const symbol = d.symbol.replace('USDT', '');
          symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1);
        });

        return {
          cycleId,
          timestamp,
          thinkingTime,
          executed,
          skipped,
          total: cycleDecisions.length,
          symbolData: Array.from(symbolCounts.entries()).map(([name, value]) => ({
            name,
            value
          })),
          symbols: Array.from(symbolCounts.keys()),
          decisions: cycleDecisions.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [decisions]);

  const toggleCycle = (cycleId: string) => {
    setExpandedCycles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cycleId)) {
        newSet.delete(cycleId);
      } else {
        newSet.add(cycleId);
      }
      return newSet;
    });
  };

  // Format relative time (e.g., "2m ago", "just now")
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const seconds = Math.floor((currentTime - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Detect new cycles and trigger animations
  useEffect(() => {
    const currentCycleIds = new Set(tradingCycles.map(cycle => cycle.cycleId));

    // Skip animation on initial mount - just initialize previousCycleIds
    if (isInitialMount.current) {
      previousCycleIds.current = currentCycleIds;
      isInitialMount.current = false;
      return;
    }

    const newlyArrivedCycles: string[] = [];

    // Find cycles that are in current but not in previous
    currentCycleIds.forEach(cycleId => {
      if (!previousCycleIds.current.has(cycleId)) {
        newlyArrivedCycles.push(cycleId);
      }
    });

    // Add new cycles to the animation set (only if not initial mount)
    if (newlyArrivedCycles.length > 0) {
      setNewCycles(prev => {
        const updated = new Set(prev);
        newlyArrivedCycles.forEach(id => updated.add(id));
        return updated;
      });

      // Auto-expand new cycles
      setExpandedCycles(prev => {
        const updated = new Set(prev);
        newlyArrivedCycles.forEach(id => updated.add(id));
        return updated;
      });

      // Remove from animation set after 3 seconds
      const timeout = setTimeout(() => {
        setNewCycles(prev => {
          const updated = new Set(prev);
          newlyArrivedCycles.forEach(id => updated.delete(id));
          return updated;
        });
      }, 3000);

      // Update previous cycle IDs
      previousCycleIds.current = currentCycleIds;

      return () => clearTimeout(timeout);
    } else {
      // Update previous cycle IDs even when no new cycles
      previousCycleIds.current = currentCycleIds;
    }
  }, [tradingCycles]);

  // Detect cycles that need to be dropped (beyond max visible)
  useEffect(() => {
    if (tradingCycles.length > maxVisibleCycles) {
      // Get cycles that should be dropped (index 5 and beyond)
      const cyclesToDrop = tradingCycles.slice(maxVisibleCycles).map(c => c.cycleId);

      // Mark them as dropping
      setDroppingCycles(new Set(cyclesToDrop));

      // After animation, clear dropping state
      // (the cycles will be removed from display by slice in render)
      const timeout = setTimeout(() => {
        setDroppingCycles(new Set());
      }, 500);

      return () => clearTimeout(timeout);
    } else {
      setDroppingCycles(new Set());
    }
  }, [tradingCycles, maxVisibleCycles]);

  // Get visible cycles (top 5 + any that are dropping)
  const visibleCycles = tradingCycles.filter((cycle, idx) => {
    return idx < maxVisibleCycles || droppingCycles.has(cycle.cycleId);
  });

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {visibleCycles.length > 0 ? (
        visibleCycles.map((cycle) => {
          const isExpanded = expandedCycles.has(cycle.cycleId);
          const isNew = newCycles.has(cycle.cycleId);
          const isDropping = droppingCycles.has(cycle.cycleId);

          // Build animation classes
          const animationClasses = [
            isNew ? 'thinking-cycle-enter thinking-cycle-glow' : '',
            isDropping ? 'thinking-cycle-drop' : ''
          ].filter(Boolean).join(' ');

          return (
            <div
              key={cycle.cycleId}
              className={`border-l-2 pl-3 py-3 hover:bg-[var(--arena-border)]/30 transition-all duration-200 ${animationClasses}`}
              style={{
                borderColor: agentColor,
                boxShadow: `0 0 10px ${agentColor}20`
              }}
            >
              {/* Cycle Header - Clickable to expand/collapse */}
              <div
                className="cursor-pointer"
                onClick={() => toggleCycle(cycle.cycleId)}
              >
                <div className="flex items-center justify-between mb-3">
                  {/* Left: Time + Stats */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-[var(--arena-text)] text-xs font-mono">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <span className="text-[var(--arena-text-dim)] text-xs font-mono">
                      {formatTimeAgo(cycle.timestamp)}
                    </span>
                    {cycle.thinkingTime && (
                      <>
                        <span className="text-[var(--arena-text-dim)] text-xs">•</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-[var(--arena-text-dim)] text-xs font-mono font-semibold cursor-help">
                              {(cycle.thinkingTime / 1000).toFixed(1)}s
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>How long AI took to generate analysis</p>
                          </TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </div>

                  {/* Right: Executed/Skipped Stats */}
                  <div className="flex items-center gap-3 text-xs font-mono font-semibold text-[var(--arena-text-dim)]">
                    <span>{cycle.executed} Executed</span>
                    <span>{cycle.skipped} Hold</span>
                  </div>
                </div>

                {/* Symbol badges when collapsed */}
                {!isExpanded && (
                  <div className="flex flex-wrap gap-2">
                    {cycle.symbols.map((symbol) => (
                      <span
                        key={symbol}
                        className="px-3 py-1.5 rounded text-xs font-mono font-bold tracking-wide bg-[#2a2a2a]/40 text-[var(--arena-text)] border-[1.5px] border-[#3a3a3a]"
                      >
                        {symbol}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Expanded: Individual Decisions (LOGS style) */}
              {isExpanded && (
                <div className="space-y-3 mt-3" onClick={(e) => e.stopPropagation()}>
                  {cycle.decisions.map((decision, idx) => {
                    const actionColor =
                      decision.action === 'buy' ? 'text-[var(--arena-green)]' :
                      decision.action === 'sell' ? 'text-[var(--arena-red)]' :
                      'text-[var(--arena-text-dim)]';

                    return (
                      <div
                        key={idx}
                        className="pl-3 border-l-2 border-[var(--arena-border)] py-1.5"
                      >
                        {/* Symbol + Action + Executed Status */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[var(--arena-text)] text-sm font-mono font-semibold">
                            {decision.symbol.replace('USDT', '')}
                          </span>
                          <span className={`text-xs font-mono font-bold uppercase ${actionColor}`}>
                            {decision.action}
                          </span>
                          {decision.executed ? (
                            <span className="text-[var(--arena-green)] text-sm">✓</span>
                          ) : (
                            <span className="text-[var(--arena-text-dim)] text-sm">⏭</span>
                          )}
                          <span className="text-[10px] font-mono text-[var(--arena-text-dim)] ml-auto">
                            Conf: {decision.confidence}%
                          </span>
                        </div>

                        {/* Reasoning */}
                        <div className="text-[10px] text-[var(--arena-text-dim)] line-clamp-2 leading-relaxed">
                          {decision.reasoning}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-[var(--arena-text-dim)] text-sm font-mono italic text-center py-8">
          No trading cycles yet
        </div>
      )}
      </div>
    </TooltipProvider>
  );
}
