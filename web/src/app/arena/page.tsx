"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  arenaApi,
  type ArenaAgent,
  type BalanceHistoryPoint,
  type ArenaTrade,
  type MarketPrice,
  type ArenaPosition,
  type ArenaDecision,
} from "@/lib/arenaApi";
import { BalanceChart } from "./components/BalanceChart";
import { ActivityLog } from "./components/ActivityLog";
import { TokenTicker } from "./components/TokenTicker";
import { Loader2 } from "lucide-react";
import SimplifiedAgentCard from "./components/SimplifiedAgentCard";
import AgentDetailModal from "./components/AgentDetailModal";

export default function ArenaPage() {
  const router = useRouter();

  // State
  const [agents, setAgents] = useState<ArenaAgent[]>([]);
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistoryPoint[]>(
    []
  );
  const [trades, setTrades] = useState<ArenaTrade[]>([]);
  const [positions, setPositions] = useState<ArenaPosition[]>([]);
  const [decisions, setDecisions] = useState<ArenaDecision[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<ArenaAgent | null>(null);

  // Initial data load
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setError(null);

        const [
          agentsData,
          historyData,
          tradesData,
          positionsData,
          decisionsData,
          pricesData,
        ] = await Promise.all([
          arenaApi.getAgents(),
          arenaApi.getBalanceHistory("24h"),
          arenaApi.getRecentTrades(50),
          arenaApi.getPositions(),
          arenaApi.getRecentDecisions(100),
          arenaApi.getMarketPrices(),
        ]);

        debugger;
        setAgents(agentsData.agents);
        setBalanceHistory(historyData.history);
        setTrades(tradesData.trades);
        setPositions(positionsData.positions);
        setDecisions(decisionsData.decisions);
        setMarketPrices(pricesData.prices);
      } catch (err) {
        console.error("Failed to load arena data:", err);
        setError("Failed to load arena data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Polling for updates (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [agentsData, tradesData, decisionsData, pricesData] =
          await Promise.all([
            arenaApi.getAgents(),
            arenaApi.getRecentTrades(20), // Only fetch recent
            arenaApi.getRecentDecisions(50),
            arenaApi.getMarketPrices(),
          ]);

        setAgents(agentsData.agents);
        setTrades(tradesData.trades);
        setDecisions(decisionsData.decisions);
        setMarketPrices(pricesData.prices);
      } catch (err) {
        console.error("Failed to update arena data:", err);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Update balance history every 60 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const historyData = await arenaApi.getBalanceHistory("24h");
        setBalanceHistory(historyData.history);
      } catch (err) {
        console.error("Failed to update balance history:", err);
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Update positions every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const positionsData = await arenaApi.getPositions();
        setPositions(positionsData.positions);
      } catch (err) {
        console.error("Failed to update positions:", err);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Get agent-specific data
  const getAgentTrades = (agentId: string) => {
    return trades.filter((trade) => trade.agent === agentId).slice(0, 10);
  };

  const getAgentDecisions = (agentId: string) => {
    return decisions
      .filter((decision) => decision.agent === agentId)
      .slice(0, 100);
  };

  const getAgentPositions = (agentId: string) => {
    return positions.filter((position) => position.agent === agentId);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--arena-bg)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--arena-green)] mx-auto mb-4" />
          <p className="text-[var(--arena-text)] font-mono">Loading Arena...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--arena-bg)]">
        <div className="text-center">
          <p className="text-[var(--arena-red)] font-mono mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--arena-card)] border border-[var(--arena-border)] rounded text-[var(--arena-text)] font-mono hover:bg-[var(--arena-border)] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--arena-bg)]">
      {/* Header */}
      <header className="bg-[var(--arena-card)] border-b border-[var(--arena-border)] px-4 md:px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Left side: logo + title */}
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Aster Logo"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <h1 className="text-sm md:text-base font-medium text-[var(--arena-text)] font-mono">
              Arena
            </h1>
          </div>

          {/* Right side: LIVE indicator + button */}
          <div className="flex items-center gap-4">
            {/* LIVE indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--arena-green)] animate-pulse"></div>
              <span className="text-xs text-[var(--arena-green)] font-mono">
                LIVE
              </span>
            </div>

            {/* Enter Platform button */}
            <button
              onClick={() => router.push("/")}
              className="px-3 py-1.5 text-xs font-mono bg-[var(--arena-green)] text-[var(--arena-bg)] rounded hover:bg-[var(--arena-green)]/80 transition-colors font-medium"
            >
              ENTER PLATFORM
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-2 py-4">
        <div
          className="
            grid
            grid-cols-1
            gap-4
            md:gap-6
            mb-6
            min-[1300px]:grid-cols-12
          "
        >
          {/* Center - Balance Chart */}
          <div className="min-[1300px]:col-span-9">
            <div className="h-[400px] md:h-[500px] lg:h-[600px]">
              <BalanceChart data={balanceHistory} agents={agents} />
            </div>

            {/* Simplified Agent Cards Below Chart */}
            <div className="mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {agents.map((agent) => (
                  <SimplifiedAgentCard
                    key={agent.id}
                    agent={agent}
                    onClick={() => setSelectedAgent(agent)}
                    isSelected={selectedAgent?.id === agent.id}
                  />
                ))}
              </div>
            </div>

            {/* Agent Detail Modal */}
            <AgentDetailModal
              agent={selectedAgent}
              isOpen={selectedAgent !== null}
              onClose={() => setSelectedAgent(null)}
              decisions={
                selectedAgent ? getAgentDecisions(selectedAgent.id) : []
              }
              positions={
                selectedAgent ? getAgentPositions(selectedAgent.id) : []
              }
              trades={selectedAgent ? getAgentTrades(selectedAgent.id) : []}
            />
          </div>

          {/* Right Sidebar - Activity Log */}
          <div className="min-[1300px]:col-span-3">
            <div className="h-[400px] md:h-[500px] lg:h-[600px]">
              <ActivityLog
                trades={trades}
                positions={positions}
                agentInfo={agents.reduce((acc, agent) => {
                  acc[agent.id] = {
                    id: agent.id,
                    provider: agent.provider,
                    template: agent.template ? {
                      posterSrc: agent.template.posterSrc,
                      displayName: agent.template.displayName
                    } : null
                  };
                  return acc;
                }, {} as Record<string, { id: string; provider: string; template?: { posterSrc: string; displayName: string } | null }>)}
                onAgentClick={(agentId) => {
                  const agent = agents.find((a) => a.id === agentId);
                  if (agent) setSelectedAgent(agent);
                }}
                decisions={decisions}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Token Ticker */}
      <div className="fixed bottom-0 left-0 right-0">
        <TokenTicker prices={marketPrices} />
      </div>
    </div>
  );
}
