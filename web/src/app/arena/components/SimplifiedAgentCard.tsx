import Image from "next/image";
import type { ArenaAgent } from "@/lib/arenaApi";
import { formatBalance, formatPnL } from "./utils/agentCardFormatters";
import { getProviderLogo } from "@/lib/utils";

interface SimplifiedAgentCardProps {
  agent: ArenaAgent;
  onClick: () => void;
  isSelected: boolean;
}

export default function SimplifiedAgentCard({
  agent,
  onClick,
  isSelected,
}: SimplifiedAgentCardProps) {
  const frequency = agent.aiConfig?.analysisFrequency || "-";
  const maxTokens = agent.aiConfig?.maxTokens || "-";

  return (
    <div
      onClick={onClick}
      className={`bg-[var(--arena-card)] border-2 rounded-lg p-3 cursor-pointer
        hover:scale-105 transition-all duration-200
      `}
      style={{
        borderColor: agent.color,
        boxShadow: isSelected
          ? `0 0 20px ${agent.color}60, 0 0 40px ${agent.color}30`
          : `0 0 10px ${agent.color}20`,
      }}
    >
      {/* Agent Name with Avatar + Provider */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          {/* Avatar Images - Overlaid */}
          <div className="relative flex-shrink-0">
            {agent.template ? (
              <>
                <Image
                  src={agent.template.posterSrc}
                  alt={agent.agentName}
                  width={20}
                  height={20}
                  className="rounded-sm"
                />
                {/* Provider Logo - overlaid in bottom-right */}
                <div className="absolute -bottom-0.5 -right-0.5 bg-[var(--arena-bg)] rounded-full p-[1px] border border-[var(--arena-border)]">
                  <Image
                    src={getProviderLogo(agent.provider)}
                    alt={agent.provider}
                    width={10}
                    height={10}
                    className="rounded-full"
                  />
                </div>
              </>
            ) : (
              /* No template - just show provider logo */
              <Image
                src={getProviderLogo(agent.provider)}
                alt={agent.provider}
                width={20}
                height={20}
                className="rounded-sm"
              />
            )}
          </div>

          <h3 className="text-[var(--arena-text)] font-semibold text-sm truncate capitalize">
            {agent.agentName}
          </h3>
          {agent.template && (
            <span className="text-[9px] text-[var(--arena-text-dim)] uppercase">
              {agent.template.displayName}
            </span>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="flex gap-2 mb-2 text-[10px] font-mono">
        <div className="flex-1">
          <span className="text-[var(--arena-text-dim)]">Freq: </span>
          <span className="text-[var(--arena-text)]">{frequency}s</span>
        </div>
        <div className="flex-1">
          <span className="text-[var(--arena-text-dim)]">Tokens: </span>
          <span className="text-[var(--arena-text)]">{maxTokens}</span>
        </div>
      </div>

      {/* Balance & PNL - 3 column layout */}
      <div className="flex gap-2 justify-between">
        {/* Balance */}
        <div className="flex flex-col items-start">
          <div className="text-[9px] text-[var(--arena-text-dim)] uppercase mb-0.5">
            Balance
          </div>
          <div className="text-sm font-mono font-bold text-[var(--arena-text)]">
            ${formatBalance(agent.balance)}
          </div>
        </div>

        {/* Unrealized PnL */}
        <div className="flex flex-col items-start">
          <div className="text-[9px] text-[var(--arena-text-dim)] uppercase mb-0.5">
            Unrealized
          </div>
          <div
            className={`text-sm font-mono font-semibold ${
              agent.pnl >= 0
                ? "text-[var(--arena-green)]"
                : "text-[var(--arena-red)]"
            }`}
          >
            {formatPnL(agent.pnl)}
          </div>
        </div>

        {/* 7d Realized PnL */}
        <div className="flex flex-col items-start">
          <div className="text-[9px] text-[var(--arena-text-dim)] uppercase mb-0.5">
            7d PnL
          </div>
          <div
            className={`text-sm font-mono font-semibold ${
              agent.pnl7d && agent.pnl7d.realizedPnl >= 0
                ? "text-[var(--arena-green)]"
                : "text-[var(--arena-red)]"
            }`}
            title={
              agent.pnl7d
                ? `7d Performance | Records: ${
                    agent.pnl7d.recordCount
                  } | Deposits: $${agent.pnl7d.deposits.toFixed(
                    2
                  )} | Withdrawals: $${agent.pnl7d.withdrawals.toFixed(2)}`
                : "No 7d data available"
            }
          >
            {agent.pnl7d ? formatPnL(agent.pnl7d.realizedPnl) : "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
