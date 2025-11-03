"use client";

import { useState } from "react";
import Image from "next/image";
import {
  type ArenaAgent,
  type ArenaPosition,
  type ArenaTrade,
  type ArenaDecision,
} from "@/lib/arenaApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBalance, formatPnL } from "./utils/agentCardFormatters";
import { getProviderLogo } from "@/lib/utils";
import { ThinkingTab } from "./tabs/ThinkingTab";
import { PositionsTab } from "./tabs/PositionsTab";
import { PnLTab } from "./tabs/PnLTab";
import { AgentConfigDisplay } from "@/components/shared/AgentConfigDisplay";
import { VideoAvatar } from "@/components/shared/VideoAvatar";
import { Badge } from "@/components/ui/badge";

interface AgentDetailModalProps {
  agent: ArenaAgent | null;
  isOpen: boolean;
  onClose: () => void;
  decisions: ArenaDecision[];
  positions: ArenaPosition[];
  trades: ArenaTrade[];
}

export default function AgentDetailModal({
  agent,
  isOpen,
  onClose,
  decisions,
  positions,
  trades,
}: AgentDetailModalProps) {
  const [parentTab, setParentTab] = useState<"SETUP" | "ACTIVITY">("SETUP");
  const [activeTab, setActiveTab] = useState<"THINKING" | "POSITIONS" | "PNL">(
    "THINKING"
  );
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);

  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full sm:w-[60vw] sm:max-w-[1200px] sm:h-[85vh] max-w-none p-3 sm:p-4 flex flex-col bg-[#1a1a1a]">
        <DialogHeader className="pb-0">
          {/* Agent Name and Stats */}
          <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-2 px-3 sm:px-4">
            <div className="flex items-center gap-3">
              {/* AI Provider Icon */}
              <Image
                src={getProviderLogo(agent.provider)}
                alt={agent.provider}
                width={40}
                height={40}
                className="rounded-full flex-shrink-0"
              />

              <DialogTitle className="text-xl sm:text-2xl font-bold text-[var(--arena-text)] capitalize">
                {agent.agentName}
                {agent.template && (
                  <span className="ml-2 text-sm text-[var(--arena-text-dim)] font-normal">
                    (forked from {agent.template.displayName})
                  </span>
                )}
              </DialogTitle>
            </div>

            {/* Balance & PNL - Compact */}
            <div className="flex gap-4 text-left sm:text-right">
              {/* Balance */}
              <div className="flex flex-col">
                <div className="text-[9px] text-[var(--arena-text-dim)] uppercase tracking-wide mb-0.5">
                  Balance
                </div>
                <div className="text-sm font-mono font-semibold text-[var(--arena-text)]">
                  ${formatBalance(agent.balance)}
                </div>
              </div>

              {/* Unrealized PnL */}
              <div className="flex flex-col">
                <div className="text-[9px] text-[var(--arena-text-dim)] uppercase tracking-wide mb-0.5">
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

              {/* Realized PnL (7d) */}
              <div className="flex flex-col">
                <div className="text-[9px] text-[var(--arena-text-dim)] uppercase tracking-wide mb-0.5">
                  Realized 7d
                </div>
                <div
                  className={`text-sm font-mono font-semibold ${
                    agent.pnl7d && agent.pnl7d.realizedPnl >= 0
                      ? "text-[var(--arena-green)]"
                      : "text-[var(--arena-red)]"
                  }`}
                >
                  {agent.pnl7d ? formatPnL(agent.pnl7d.realizedPnl) : "-"}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* 2-Column Layout */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden px-3 sm:px-4 pt-0 pb-3 sm:pb-4">
          {/* Left Column - VideoAvatar + Positions (horizontal on mobile, vertical on desktop) */}
          <div className="w-full md:w-80 flex-shrink-0 flex md:flex-col items-start gap-3 md:gap-4">
            {/* VideoAvatar */}
            {agent.template && (
              <div
                className="relative w-32 h-32 md:w-full md:h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 shadow-xl flex-shrink-0 self-center md:self-auto"
                onMouseEnter={() => setIsAvatarHovered(true)}
                onMouseLeave={() => setIsAvatarHovered(false)}
              >
                <VideoAvatar
                  isHovered={isAvatarHovered}
                  agentName={agent.agentName}
                  videoSrc={agent.template.videoSrc}
                  posterSrc={agent.template.posterSrc}
                />
                {/* Agent Name Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 md:p-3">
                  <div className="text-white font-bold text-[10px] md:text-sm font-mono capitalize">
                    {agent.agentName}
                  </div>
                  <div className="text-white/60 text-[8px] md:text-[10px] font-mono capitalize">
                    {agent.provider}
                  </div>
                </div>
              </div>
            )}

            {/* Active Positions */}
            {positions.length > 0 && (
              <div className="space-y-1 flex-1 md:flex-none w-full">
                <h4 className="text-[9px] font-semibold text-[var(--arena-text-dim)] uppercase">
                  Positions
                </h4>
                <div className="space-y-1">
                  {positions.map((position, idx) => (
                    <div
                      key={`${position.symbol}-${idx}`}
                      className="bg-[var(--arena-bg)]/50 p-1.5 rounded border border-[var(--arena-border)]"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[var(--arena-text)] font-semibold text-[10px] font-mono">
                            {position.symbol.replace("USDT", "")}
                          </span>
                          <span
                            className={`text-[8px] px-1 py-0.5 rounded font-mono font-bold ${
                              position.side === "LONG"
                                ? "bg-[var(--arena-green)] text-black"
                                : "bg-[var(--arena-red)] text-white"
                            }`}
                          >
                            {position.side}
                          </span>
                        </div>
                        <div
                          className={`font-semibold text-[10px] font-mono ${
                            position.unrealizedPnl >= 0
                              ? "text-[var(--arena-green)]"
                              : "text-[var(--arena-red)]"
                          }`}
                        >
                          {position.unrealizedPnl >= 0 ? "+" : ""}
                          {position.roiPercent.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-[8px] text-[var(--arena-text-dim)] font-mono">
                        {position.size.toFixed(4)} @ ${position.entryPrice.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Tabs + Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Parent Tabs */}
            <div className="flex gap-2 border-b border-[var(--arena-border)]">
              {(["SETUP", "ACTIVITY"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setParentTab(tab)}
                  className={`px-4 py-2 text-sm font-mono font-semibold transition-colors ${
                    parentTab === tab
                      ? "text-[var(--arena-text)] border-b-2"
                      : "text-[var(--arena-text-dim)] hover:text-[var(--arena-text)]"
                  }`}
                  style={{
                    borderColor:
                      parentTab === tab ? agent.color : "transparent",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {parentTab === "SETUP" && (
                <div className="p-4 space-y-6">
                  <AgentConfigDisplay
                    temperature={agent.aiConfig?.temperature}
                    maxTokens={agent.aiConfig?.maxTokens}
                    analysisFrequency={agent.aiConfig?.analysisFrequency}
                    riskTolerance={agent.aiConfig?.riskTolerance}
                    minConfidence={agent.aiConfig?.minConfidence}
                    provider={agent.provider}
                    model={agent.model}
                    systemPrompt={agent.systemPrompt}
                    tradingApproach={
                      agent.aiConfig?.weightStrategy?.tradingPhilosophy
                        ?.approach
                    }
                    indicators={
                      agent.aiConfig?.indicatorIntervals
                        ? Object.entries(agent.aiConfig.indicatorIntervals).map(
                            ([name, intervals]) => ({
                              name,
                              intervals: intervals || [],
                              philosophy:
                                agent.aiConfig?.weightStrategy?.tradingPhilosophy
                                  ?.indicators?.[name],
                            })
                          )
                        : (agent.aiConfig?.indicators || []).map((indicator) => ({
                            name: indicator,
                            intervals: agent.aiConfig?.intervals || [],
                            philosophy:
                              agent.aiConfig?.weightStrategy?.tradingPhilosophy
                                ?.indicators?.[indicator],
                          }))
                    }
                    pairs={
                      (
                        agent.aiConfig?.tradingPairs ||
                        agent.aiConfig?.pairs ||
                        []
                      ).map((pair) => ({
                        symbol: pair,
                        leverage:
                          agent.aiConfig?.symbolLeverages?.[pair] || 1,
                      }))
                    }
                    hoverCardSide="top"
                  />
                </div>
              )}

              {parentTab === "ACTIVITY" && (
                <div className="flex flex-col h-full">
                  {/* Nested Tabs */}
                  <div className="flex gap-2 border-b border-[var(--arena-border)] px-4">
                    {(["THINKING", "POSITIONS", "PNL"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-2 text-sm font-mono transition-colors ${
                          activeTab === tab
                            ? "text-[var(--arena-text)] border-b-2"
                            : "text-[var(--arena-text-dim)] hover:text-[var(--arena-text)]"
                        }`}
                        style={{
                          borderColor:
                            activeTab === tab ? agent.color : "transparent",
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Nested Tab Content */}
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {activeTab === "THINKING" && (
                      <ThinkingTab
                        decisions={decisions}
                        agentColor={agent.color}
                      />
                    )}

                    {activeTab === "POSITIONS" && (
                      <PositionsTab
                        positions={positions}
                        trades={trades}
                        agentBalance={agent.balance}
                        agentColor={agent.color}
                      />
                    )}

                    {activeTab === "PNL" && (
                      <PnLTab agent={agent} agentColor={agent.color} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
