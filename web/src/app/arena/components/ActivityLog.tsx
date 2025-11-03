"use client";

import { useState } from "react";
import Image from "next/image";
import type { ArenaTrade, ArenaPosition, ArenaDecision } from "@/lib/arenaApi";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getProviderLogo } from "@/lib/utils";

interface AgentInfo {
  id: string;
  provider: string;
  template?: {
    posterSrc: string;
    displayName: string;
  } | null;
}

interface ActivityLogProps {
  trades: ArenaTrade[];
  positions: ArenaPosition[];
  agentInfo: Record<string, AgentInfo>;
  onAgentClick?: (agentId: string) => void;
  decisions: ArenaDecision[];
}

// Shared component for AI decision history display
function AIDecisionHistory({ decisions }: { decisions: ArenaDecision[] }) {
  return (
    <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
      {decisions.map((decision, idx) => (
        <div
          key={idx}
          className="border-l-2 border-[var(--arena-border)] pl-3 py-1"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] text-[var(--arena-text-dim)]">
              {new Date(decision.timestamp).toLocaleTimeString()}
            </span>
            <span
              className={`text-[10px] font-bold uppercase ${
                decision.action === "buy"
                  ? "text-[var(--arena-green)]"
                  : decision.action === "sell" || decision.action === "close"
                  ? "text-[var(--arena-red)]"
                  : "text-[var(--arena-text)]"
              }`}
            >
              {decision.action}
            </span>
            {decision.action !== "hold" && (
              <span className="text-[9px] text-[var(--arena-text-dim)]">
                ({decision.confidence}%)
              </span>
            )}
          </div>
          <p className="text-[10px] text-[var(--arena-text-dim)] leading-relaxed">
            {decision.reasoning}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ActivityLog({
  trades,
  positions,
  agentInfo,
  onAgentClick,
  decisions,
}: ActivityLogProps) {
  const [activeTab, setActiveTab] = useState<"TRADES" | "POSITIONS" | "LOGS">(
    "TRADES"
  );

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${month}/${day} ${hours}:${minutes}`;
  };

  const getAgentColor = (agentId: string) => {
    const colors: Record<string, string> = {
      chatgpt: "var(--chatgpt)",
      deepseek: "var(--deepseek)",
      claude: "var(--claude)",
      gladiaster: "var(--gladiaster)",
    };
    return colors[agentId] || "var(--arena-text)";
  };

  return (
    <div className="bg-[var(--arena-bg)] border border-[var(--arena-border)] rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex gap-2 mb-4 border-b border-[var(--arena-border)]">
        {(["TRADES", "POSITIONS", "LOGS"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-mono transition-colors ${
              activeTab === tab
                ? "text-[var(--arena-text)] border-b-2 border-[var(--arena-green)]"
                : "text-[var(--arena-text-dim)] hover:text-[var(--arena-text)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "TRADES" && (
          <div className="space-y-3">
            {trades.length > 0 ? (
              trades.map((trade, idx) => {
                const agentData = agentInfo[trade.agent];
                return (
                  <div
                    key={`${trade.id}-${idx}`}
                    className="border-l-2 pl-3 py-2 hover:bg-[var(--arena-border)]/20 transition-colors"
                    style={{ borderColor: getAgentColor(trade.agent) }}
                  >
                    {/* Header: Time + Icon + Name */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[var(--arena-text-dim)] text-[10px] font-mono">
                        {formatTime(trade.timestamp)}
                      </span>
                      {agentData && (
                        <Image
                          src={getProviderLogo(agentData.provider)}
                          alt={trade.agent}
                          width={14}
                          height={14}
                        />
                      )}
                      <span className="text-[var(--arena-text)] text-xs font-mono font-semibold capitalize">
                        {trade.displayName}
                      </span>
                    </div>

                    {/* Trade Info: Action + Amount */}
                    {trade.reasoning ? (
                      <div className="flex gap-2 items-start">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="cursor-pointer hover:opacity-75 transition-opacity">
                              <div className="flex items-baseline gap-1.5 mb-1">
                                <span
                                  className={`text-sm font-mono font-bold uppercase ${
                                    trade.side === "BUY"
                                      ? "text-[var(--arena-green)]"
                                      : "text-[var(--arena-red)]"
                                  }`}
                                >
                                  {trade.action}
                                </span>
                                <span className="text-[var(--arena-text)] text-sm font-mono font-semibold">
                                  {trade.quantity.toFixed(4)}
                                </span>
                                <span className="text-[var(--arena-text-dim)] text-xs font-mono">
                                  {trade.symbol.replace("USDT", "")}
                                </span>
                                {trade.confidence && (
                                  <span className="text-[9px] text-[var(--arena-green)] ml-1">
                                    💡 {trade.confidence}%
                                  </span>
                                )}
                              </div>

                              {/* Price + Total Value */}
                              <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--arena-text-dim)]">
                                <span>@ ${trade.price.toLocaleString()}</span>
                                <span>•</span>
                                <span>Total: ${trade.value.toFixed(2)}</span>
                              </div>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent
                            side="left"
                            align="center"
                            sideOffset={8}
                            className="w-96 bg-[var(--arena-card)] border-[var(--arena-border)]"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 pb-2 border-b border-[var(--arena-border)]">
                                <span className="text-[var(--arena-text)] text-sm font-mono font-bold">
                                  {trade.symbol.replace("USDT", "")}
                                </span>
                                <span
                                  className={`text-xs font-mono font-bold uppercase ${
                                    trade.side === "BUY"
                                      ? "text-[var(--arena-green)]"
                                      : "text-[var(--arena-red)]"
                                  }`}
                                >
                                  {trade.side}
                                </span>
                                {trade.confidence && (
                                  <span className="text-[10px] font-mono text-[var(--arena-text-dim)] ml-auto">
                                    Confidence: {trade.confidence}%
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[var(--arena-text-dim)] leading-relaxed">
                                <div className="font-semibold text-[var(--arena-text)] mb-2">
                                  AI Decision:
                                </div>
                                {trade.aiDecisions &&
                                trade.aiDecisions.length > 0 ? (
                                  <AIDecisionHistory
                                    decisions={trade.aiDecisions}
                                  />
                                ) : (
                                  <p className="text-[10px]">
                                    {trade.reasoning}
                                  </p>
                                )}
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                        {/* Mobile-friendly dialog button */}
                        {trade.aiDecisions && trade.aiDecisions.length > 0 && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--arena-border)] hover:bg-[var(--arena-border)] transition-colors text-[var(--arena-text)] mt-1">
                                📊
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[80vh] overflow-hidden bg-[var(--arena-card)] border-[var(--arena-border)]">
                              <DialogHeader>
                                <div className="flex items-center gap-2 pb-2">
                                  <span className="text-[var(--arena-text)] text-sm font-mono font-bold">
                                    {trade.symbol.replace("USDT", "")}
                                  </span>
                                  <span
                                    className={`text-xs font-mono font-bold uppercase ${
                                      trade.side === "BUY"
                                        ? "text-[var(--arena-green)]"
                                        : "text-[var(--arena-red)]"
                                    }`}
                                  >
                                    {trade.side}
                                  </span>
                                  {trade.confidence && (
                                    <span className="text-[10px] font-mono text-[var(--arena-text-dim)] ml-auto">
                                      Confidence: {trade.confidence}%
                                    </span>
                                  )}
                                </div>
                              </DialogHeader>
                              <div className="text-xs text-[var(--arena-text-dim)] leading-relaxed">
                                <AIDecisionHistory
                                  decisions={trade.aiDecisions}
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1.5 mb-1">
                          <span
                            className={`text-sm font-mono font-bold uppercase ${
                              trade.side === "BUY"
                                ? "text-[var(--arena-green)]"
                                : "text-[var(--arena-red)]"
                            }`}
                          >
                            {trade.action}
                          </span>
                          <span className="text-[var(--arena-text)] text-sm font-mono font-semibold">
                            {trade.quantity.toFixed(4)}
                          </span>
                          <span className="text-[var(--arena-text-dim)] text-xs font-mono">
                            {trade.symbol.replace("USDT", "")}
                          </span>
                        </div>

                        {/* Price + Total Value */}
                        <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--arena-text-dim)]">
                          <span>@ ${trade.price.toLocaleString()}</span>
                          <span>•</span>
                          <span>Total: ${trade.value.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-[var(--arena-text-dim)] text-sm font-mono italic text-center py-8">
                No recent trades
              </div>
            )}
          </div>
        )}

        {activeTab === "POSITIONS" && (
          <div className="space-y-3">
            {positions.length > 0 ? (
              (() => {
                // Group positions by agent
                const positionsByAgent = positions.reduce((acc, position) => {
                  if (!acc[position.agent]) {
                    acc[position.agent] = [];
                  }
                  acc[position.agent].push(position);
                  return acc;
                }, {} as Record<string, ArenaPosition[]>);

                return Object.entries(positionsByAgent).map(
                  ([agentId, agentPositions]) => {
                    const firstPosition = agentPositions[0];
                    const totalPnl = agentPositions.reduce(
                      (sum, pos) => sum + pos.unrealizedPnl,
                      0
                    );
                    const agentData = agentInfo[agentId];

                    return (
                      <div
                        key={agentId}
                        className="bg-[#0a0a0a] border-2 rounded p-3"
                        style={{ borderColor: getAgentColor(agentId) }}
                      >
                        {/* Agent Header */}
                        <div className="mb-3 pb-2 border-b border-[var(--arena-border)]">
                          <div className="flex items-center justify-between">
                            {/* Left: Template Avatar + Provider Logo + Name */}
                            <div className="flex items-center gap-2">
                              {agentData?.template && (
                                <Image
                                  src={agentData.template.posterSrc}
                                  alt={agentData.template.displayName}
                                  width={32}
                                  height={32}
                                  className="rounded"
                                />
                              )}
                              {agentData && (
                                <Image
                                  src={getProviderLogo(agentData.provider)}
                                  alt={agentId}
                                  width={20}
                                  height={20}
                                  className="rounded-full"
                                />
                              )}
                              <span
                                className="text-sm font-mono font-semibold capitalize"
                                style={{ color: getAgentColor(agentId) }}
                              >
                                {firstPosition.displayName}
                              </span>
                            </div>

                            {/* Right: Total PnL + Button */}
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-mono font-semibold ${
                                  totalPnl >= 0
                                    ? "text-[var(--arena-green)]"
                                    : "text-[var(--arena-red)]"
                                }`}
                              >
                                {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
                              </span>
                              <button
                                onClick={() => onAgentClick?.(agentId)}
                                className="text-xs px-2 py-1 rounded border border-[var(--arena-border)] hover:bg-[var(--arena-border)] transition-colors text-[var(--arena-text)]"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Positions List */}
                        <div className="space-y-2">
                          {agentPositions.map((position, idx) => (
                            <div
                              key={`${position.symbol}-${idx}`}
                              className="font-mono"
                            >
                              {/* Position Header */}
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[var(--arena-text)] font-semibold text-sm">
                                    {position.symbol.replace("USDT", "")}
                                  </span>
                                  <span
                                    className={`text-[9px] px-1 py-0.5 rounded font-mono ${
                                      position.side === "LONG"
                                        ? "bg-[var(--arena-green)] text-black"
                                        : "bg-[var(--arena-red)] text-white"
                                    }`}
                                  >
                                    {position.side}
                                  </span>
                                </div>
                                <span
                                  className={`font-semibold text-sm ${
                                    position.unrealizedPnl >= 0
                                      ? "text-[var(--arena-green)]"
                                      : "text-[var(--arena-red)]"
                                  }`}
                                >
                                  {position.unrealizedPnl >= 0 ? "+" : ""}$
                                  {position.unrealizedPnl.toFixed(2)}
                                  <span className="text-[10px] ml-1">
                                    {position.roiPercent >= 0 ? "+" : ""}
                                    {position.roiPercent.toFixed(2)}%
                                  </span>
                                </span>
                              </div>

                              {/* Position Details */}
                              {position.reasoning ? (
                                <div className="flex gap-2 items-center">
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <div className="flex gap-4 text-[9px] text-[var(--arena-text)] cursor-pointer hover:text-[var(--arena-text-dim)] transition-colors">
                                        <span>
                                          Size:{" "}
                                          <span className="text-[var(--arena-text-dim)]">
                                            {position.size.toFixed(4)}
                                          </span>
                                        </span>
                                        <span>
                                          Entry:{" "}
                                          <span className="text-[var(--arena-text-dim)]">
                                            $
                                            {position.entryPrice.toLocaleString()}
                                          </span>
                                        </span>
                                        <span>
                                          Mark:{" "}
                                          <span className="text-[var(--arena-text-dim)]">
                                            $
                                            {position.markPrice.toLocaleString()}
                                          </span>
                                        </span>
                                        {position.confidence && (
                                          <span className="text-[var(--arena-green)]">
                                            💡 AI: {position.confidence}%
                                          </span>
                                        )}
                                      </div>
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                      side="left"
                                      align="center"
                                      sideOffset={8}
                                      className="w-96 bg-[var(--arena-card)] border-[var(--arena-border)]"
                                    >
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 pb-2 border-b border-[var(--arena-border)]">
                                          <span className="text-[var(--arena-text)] text-sm font-mono font-bold">
                                            {position.symbol.replace(
                                              "USDT",
                                              ""
                                            )}
                                          </span>
                                          <span
                                            className={`text-xs font-mono font-bold uppercase ${
                                              position.side === "LONG"
                                                ? "text-[var(--arena-green)]"
                                                : "text-[var(--arena-red)]"
                                            }`}
                                          >
                                            {position.side}
                                          </span>
                                          <span
                                            className={`text-sm font-mono font-bold ${
                                              position.roiPercent >= 0
                                                ? "text-[var(--arena-green)]"
                                                : "text-[var(--arena-red)]"
                                            }`}
                                          >
                                            {position.roiPercent >= 0
                                              ? "+"
                                              : ""}
                                            {position.roiPercent.toFixed(2)}%
                                          </span>
                                          {position.confidence && (
                                            <span className="text-[10px] font-mono text-[var(--arena-text-dim)] ml-auto">
                                              Confidence: {position.confidence}%
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-[var(--arena-text-dim)] leading-relaxed">
                                          <div className="font-semibold text-[var(--arena-text)] mb-2">
                                            AI Decision History:
                                          </div>
                                          {position.aiDecisions &&
                                          position.aiDecisions.length > 0 ? (
                                            <AIDecisionHistory
                                              decisions={position.aiDecisions}
                                            />
                                          ) : (
                                            <p className="text-[10px]">
                                              {position.reasoning}
                                            </p>
                                          )}
                                        </div>
                                        {position.orderId && (
                                          <div className="text-[9px] text-[var(--arena-text-dim)] pt-2 border-t border-[var(--arena-border)] font-mono">
                                            Order ID: {position.orderId}
                                          </div>
                                        )}
                                        {position.exitStrategy && (
                                          <div className="text-[9px] text-[var(--arena-text-dim)] font-mono">
                                            Exit: {position.exitStrategy}
                                          </div>
                                        )}
                                      </div>
                                    </HoverCardContent>
                                  </HoverCard>
                                  {/* Mobile-friendly dialog button */}
                                  {position.aiDecisions &&
                                    position.aiDecisions.length > 0 && (
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <button className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--arena-border)] hover:bg-[var(--arena-border)] transition-colors text-[var(--arena-text)]">
                                            📊
                                          </button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[80vh] overflow-hidden bg-[var(--arena-card)] border-[var(--arena-border)]">
                                          <DialogHeader>
                                            <div className="flex items-center gap-2 pb-2">
                                              <span className="text-[var(--arena-text)] text-sm font-mono font-bold">
                                                {position.symbol.replace(
                                                  "USDT",
                                                  ""
                                                )}
                                              </span>
                                              <span
                                                className={`text-xs font-mono font-bold uppercase ${
                                                  position.side === "LONG"
                                                    ? "text-[var(--arena-green)]"
                                                    : "text-[var(--arena-red)]"
                                                }`}
                                              >
                                                {position.side}
                                              </span>
                                              <span
                                                className={`text-sm font-mono font-bold ${
                                                  position.roiPercent >= 0
                                                    ? "text-[var(--arena-green)]"
                                                    : "text-[var(--arena-red)]"
                                                }`}
                                              >
                                                {position.roiPercent >= 0
                                                  ? "+"
                                                  : ""}
                                                {position.roiPercent.toFixed(2)}
                                                %
                                              </span>
                                              {position.confidence && (
                                                <span className="text-[10px] font-mono text-[var(--arena-text-dim)] ml-auto">
                                                  Confidence:{" "}
                                                  {position.confidence}%
                                                </span>
                                              )}
                                            </div>
                                          </DialogHeader>
                                          <div className="text-xs text-[var(--arena-text-dim)] leading-relaxed">
                                            <AIDecisionHistory
                                              decisions={position.aiDecisions}
                                            />
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    )}
                                </div>
                              ) : (
                                <div className="flex gap-4 text-[9px] text-[var(--arena-text)]">
                                  <span>
                                    Size:{" "}
                                    <span className="text-[var(--arena-text-dim)]">
                                      {position.size.toFixed(4)}
                                    </span>
                                  </span>
                                  <span>
                                    Entry:{" "}
                                    <span className="text-[var(--arena-text-dim)]">
                                      ${position.entryPrice.toLocaleString()}
                                    </span>
                                  </span>
                                  <span>
                                    Mark:{" "}
                                    <span className="text-[var(--arena-text-dim)]">
                                      ${position.markPrice.toLocaleString()}
                                    </span>
                                  </span>
                                </div>
                              )}

                              {/* Divider between positions (except last one) */}
                              {idx < agentPositions.length - 1 && (
                                <div className="mt-2 border-t border-[var(--arena-border)]" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                );
              })()
            ) : (
              <div className="text-[var(--arena-text-dim)] text-sm font-mono italic text-center py-8">
                No open positions
              </div>
            )}
          </div>
        )}

        {activeTab === "LOGS" && (
          <div className="space-y-3">
            {decisions.length > 0 ? (
              decisions.map((decision, idx) => {
                const agentData = agentInfo[decision.agent];
                const actionColor =
                  decision.action === "buy"
                    ? "text-[var(--arena-green)]"
                    : decision.action === "sell"
                    ? "text-[var(--arena-red)]"
                    : "text-[var(--arena-text-dim)]";

                return (
                  <div
                    key={idx}
                    className="border-l-2 pl-3 py-2 hover:bg-[var(--arena-border)]/20 transition-colors"
                    style={{ borderColor: getAgentColor(decision.agent) }}
                  >
                    {/* Header: Time + Icon + Agent */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[var(--arena-text-dim)] text-[10px] font-mono">
                        {(() => {
                          const date = new Date(decision.timestamp);
                          const month = (date.getMonth() + 1)
                            .toString()
                            .padStart(2, "0");
                          const day = date
                            .getDate()
                            .toString()
                            .padStart(2, "0");
                          const hours = date
                            .getHours()
                            .toString()
                            .padStart(2, "0");
                          const minutes = date
                            .getMinutes()
                            .toString()
                            .padStart(2, "0");
                          return `${month}/${day} ${hours}:${minutes}`;
                        })()}
                      </span>
                      {agentData && (
                        <Image
                          src={getProviderLogo(agentData.provider)}
                          alt={decision.agent}
                          width={14}
                          height={14}
                        />
                      )}
                      <span className="text-[var(--arena-text)] text-xs font-mono font-semibold capitalize">
                        {decision.displayName}
                      </span>
                    </div>

                    {/* Symbol + Action + Confidence */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[var(--arena-text)] text-sm font-mono font-bold">
                        {decision.symbol}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold uppercase ${actionColor}`}
                      >
                        {decision.action}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--arena-text-dim)]">
                        Conf: {decision.confidence}%
                      </span>
                    </div>

                    {/* Reasoning (truncated) - Hover for full text */}
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="text-[10px] text-[var(--arena-text-dim)] line-clamp-2 leading-relaxed cursor-pointer hover:text-[var(--arena-text)] transition-colors">
                          {decision.reasoning}
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-96 bg-[var(--arena-card)] border-[var(--arena-border)]">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 pb-2 border-b border-[var(--arena-border)]">
                            <span className="text-[var(--arena-text)] text-sm font-mono font-bold">
                              {decision.symbol}
                            </span>
                            <span
                              className={`text-xs font-mono font-bold uppercase ${actionColor}`}
                            >
                              {decision.action}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--arena-text-dim)] ml-auto">
                              Conf: {decision.confidence}%
                            </span>
                          </div>
                          <div className="text-xs text-[var(--arena-text-dim)] leading-relaxed">
                            {decision.reasoning}
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                );
              })
            ) : (
              <div className="text-[var(--arena-text-dim)] text-sm font-mono italic text-center py-8">
                No recent AI decisions
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
