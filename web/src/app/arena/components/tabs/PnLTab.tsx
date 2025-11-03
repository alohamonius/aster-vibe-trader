"use client";

import type { ArenaAgent } from "@/lib/arenaApi";

interface PnLTabProps {
  agent: ArenaAgent;
  agentColor: string;
}

// Format PnL value
const formatPnL = (value: number) => {
  const sign = value >= 0 ? "+" : "";
  return `${sign}$${value.toFixed(2)}`;
};

export function PnLTab({ agent, agentColor }: PnLTabProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--arena-text-dim)] uppercase mb-1">
          Performance Metrics
        </h3>
        <p className="text-xs text-[var(--arena-text-dim)]">
          Historical trading performance and account activity
        </p>
      </div>

      {/* PnL Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1 Day Performance */}
        {agent.pnl1h ? (
          <div
            className="space-y-3 p-4 rounded-lg border-2 transition-all hover:shadow-lg"
            style={{
              borderColor: `${agentColor}40`,
              backgroundColor: "#1a1a1a",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[var(--arena-text)] uppercase">
                1 Day Performance
              </h4>
              <div
                className="px-2 py-1 rounded text-xs font-mono font-semibold"
                style={{
                  backgroundColor: `${agentColor}20`,
                  color: agentColor,
                }}
              >
                1D
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Realized PnL */}
              <div className="flex justify-between items-center p-2 rounded bg-[#0f0f0f]">
                <span className="text-xs text-[var(--arena-text-dim)] font-mono">
                  Realized PnL
                </span>
                <span
                  className={`text-base font-mono font-bold ${
                    agent.pnl1h.realizedPnl >= 0
                      ? "text-[var(--arena-green)]"
                      : "text-[var(--arena-red)]"
                  }`}
                >
                  {formatPnL(agent.pnl1h.realizedPnl)}
                </span>
              </div>

              {/* Deposits */}
              <div className="flex justify-between items-center p-2 rounded bg-[#0f0f0f]">
                <span className="text-xs text-[var(--arena-text-dim)] font-mono">
                  Deposits
                </span>
                <span className="text-sm font-mono text-[var(--arena-text)]">
                  {formatPnL(agent.pnl1h.deposits)}
                </span>
              </div>

              {/* Withdrawals */}
              <div className="flex justify-between items-center p-2 rounded bg-[#0f0f0f]">
                <span className="text-xs text-[var(--arena-text-dim)] font-mono">
                  Withdrawals
                </span>
                <span className="text-sm font-mono text-[var(--arena-text)]">
                  {formatPnL(agent.pnl1h.withdrawals)}
                </span>
              </div>

              {/* Commissions */}
              <div className="flex justify-between items-center p-2 rounded bg-[#0f0f0f]">
                <span className="text-xs text-[var(--arena-text-dim)] font-mono">
                  Commissions
                </span>
                <span className="text-sm font-mono text-[var(--arena-red)]">
                  {formatPnL(agent.pnl1h.commissions)}
                </span>
              </div>

              {/* Net Transfers */}
              <div className="flex justify-between items-center p-2 rounded bg-[#0f0f0f]">
                <span className="text-xs text-[var(--arena-text-dim)] font-mono">
                  Net Transfers
                </span>
                <span
                  className={`text-sm font-mono font-semibold ${
                    agent.pnl1h.deposits + agent.pnl1h.withdrawals >= 0
                      ? "text-[var(--arena-green)]"
                      : "text-[var(--arena-red)]"
                  }`}
                >
                  {formatPnL(agent.pnl1h.deposits + agent.pnl1h.withdrawals)}
                </span>
              </div>

              {/* Record Count */}
              {/* <div className="flex justify-between items-center p-2 rounded border-t border-[var(--arena-border)] mt-3 pt-3">
                <span className="text-xs text-[var(--arena-text-dim)] font-mono">
                  Transaction Records
                </span>
                <span className="text-sm font-mono font-semibold text-[var(--arena-text)]">
                  {agent.pnl1h.recordCount}
                </span>
              </div> */}
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-lg border border-[var(--arena-border)] bg-[#1a1a1a] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-[var(--arena-text-dim)] font-mono">
                No 1d data available
              </p>
            </div>
          </div>
        )}

        {/* 7 Day Performance */}
        {agent.pnl7d ? (
          <div
            className="space-y-3 p-4 rounded-lg border-2 transition-all hover:shadow-lg"
            style={{
              borderColor: `${agentColor}40`,
              backgroundColor: "#1a1a1a",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[var(--arena-text)] uppercase">
                7 Day Performance
              </h4>
              <div
                className="px-2 py-1 rounded text-xs font-mono font-semibold"
                style={{
                  backgroundColor: `${agentColor}20`,
                  color: agentColor,
                }}
              >
                7D
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Realized PnL */}
              <div className="flex justify-between items-center p-2 rounded bg-[#0f0f0f]">
                <span className="text-xs text-[var(--arena-text-dim)] font-mono">
                  Realized PnL
                </span>
                <span
                  className={`text-base font-mono font-bold ${
                    agent.pnl7d.realizedPnl >= 0
                      ? "text-[var(--arena-green)]"
                      : "text-[var(--arena-red)]"
                  }`}
                >
                  {formatPnL(agent.pnl7d.realizedPnl)}
                </span>
              </div>

              {/* Deposits */}
              <div className="flex justify-between items-center p-2 rounded bg-[#0f0f0f]">
                <span className="text-xs text-[var(--arena-text-dim)] font-mono">
                  Deposits
                </span>
                <span className="text-sm font-mono text-[var(--arena-text)]">
                  {formatPnL(agent.pnl7d.deposits)}
                </span>
              </div>

              {/* Withdrawals */}
              <div className="flex justify-between items-center p-2 rounded bg-[#0f0f0f]">
                <span className="text-xs text-[var(--arena-text-dim)] font-mono">
                  Withdrawals
                </span>
                <span className="text-sm font-mono text-[var(--arena-text)]">
                  {formatPnL(agent.pnl7d.withdrawals)}
                </span>
              </div>

              {/* Commissions */}
              <div className="flex justify-between items-center p-2 rounded bg-[#0f0f0f]">
                <span className="text-xs text-[var(--arena-text-dim)] font-mono">
                  Commissions
                </span>
                <span className="text-sm font-mono text-[var(--arena-red)]">
                  {formatPnL(agent.pnl7d.commissions)}
                </span>
              </div>

              {/* Net Transfers */}
              <div className="flex justify-between items-center p-2 rounded bg-[#0f0f0f]">
                <span className="text-xs text-[var(--arena-text-dim)] font-mono">
                  Net Transfers
                </span>
                <span
                  className={`text-sm font-mono font-semibold ${
                    agent.pnl7d.deposits + agent.pnl7d.withdrawals >= 0
                      ? "text-[var(--arena-green)]"
                      : "text-[var(--arena-red)]"
                  }`}
                >
                  {formatPnL(agent.pnl7d.deposits + agent.pnl7d.withdrawals)}
                </span>
              </div>

              {/* Record Count */}
              <div className="flex justify-between items-center p-2 rounded border-t border-[var(--arena-border)] mt-3 pt-3">
                <span className="text-xs text-[var(--arena-text-dim)] font-mono">
                  Transaction Records
                </span>
                <span className="text-sm font-mono font-semibold text-[var(--arena-text)]">
                  {agent.pnl7d.recordCount}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-lg border border-[var(--arena-border)] bg-[#1a1a1a] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-[var(--arena-text-dim)] font-mono">
                No 7d data available
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Section */}
      {(agent.pnl1h || agent.pnl7d) && (
        <div className="mt-6 p-4 rounded-lg border border-[var(--arena-border)] bg-[#0f0f0f]">
          <h4 className="text-xs font-semibold text-[var(--arena-text-dim)] uppercase mb-3">
            Notes
          </h4>
          <ul className="space-y-2 text-xs text-[var(--arena-text-dim)] font-mono">
            <li className="flex items-start gap-2">
              <span className="text-[var(--arena-green)] mt-0.5">•</span>
              <span>
                Realized PnL includes trading profits/losses, funding fees,
                commissions, and rebates
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--arena-green)] mt-0.5">•</span>
              <span>
                Net Transfers = Deposits + Withdrawals (showing net account
                funding changes)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--arena-green)] mt-0.5">•</span>
              <span>
                Transaction Records count all income events (trades, funding,
                transfers, etc.)
              </span>
            </li>
          </ul>
        </div>
      )}

      {/* No Data Message */}
      {!agent.pnl1h && !agent.pnl7d && (
        <div className="p-12 text-center">
          <p className="text-sm text-[var(--arena-text-dim)] font-mono">
            No PnL data available for this agent
          </p>
        </div>
      )}
    </div>
  );
}
