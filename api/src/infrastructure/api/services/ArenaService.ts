import {
  ARENA_AGENTS,
  ARENA_AGENT_METADATA,
  ARENA_CONFIG,
  ArenaAgentId,
} from "@/shared/config/arena";
import { getAgentByNameSystemWide } from "@/infrastructure/database/queries/agents";
import {
  getAIDecisionsFiltered,
  getAIDecisionsByOrderId,
} from "@/infrastructure/database/queries/aiDecisions";
import { getUserTrades } from "@/infrastructure/database/queries/trades";
import { AgentManager } from "@/core/agents/AgentManager";
import { logger } from "@/shared/utils/logger";
import { detectTemplate } from "@/shared/utils/detectTemplate";
import { MarketDataProvider } from "@/services/ai/trading/providers/MarketDataProvider";
import {
  matchPositionsToDecisions,
  matchTradesToDecisions,
} from "@/shared/utils/aiDecisionMatcher";
import { ArenaAgent } from "../types/ArenaAgent";
import { BalanceHistoryPoint } from "../types/BalanceHistoryPoint";
import { ArenaPosition } from "../types/ArenaPosition";
import { ArenaTrade } from "../types/ArenaTrade";
import { ArenaDecision } from "../types/ArenaDecision";
import { MarketPrice } from "../types/MarketPrice";
import { ArenaStats } from "../types/ArenaStats";

export class ArenaService {
  private static instance: ArenaService;
  private agentManager: AgentManager;
  private marketDataProvider: MarketDataProvider;

  private arenaAgentsCache: ArenaAgent[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 300000;

  private inflightFetch: Promise<ArenaAgent[]> | null = null;

  private constructor() {
    this.agentManager = AgentManager.getInstance();
    this.marketDataProvider = MarketDataProvider.getInstance();
  }

  public static getInstance(): ArenaService {
    if (!ArenaService.instance) {
      ArenaService.instance = new ArenaService();
    }
    return ArenaService.instance;
  }

  private async getActiveArenaAgentNames(): Promise<string[]> {
    if (ARENA_CONFIG.topAgentsMode === "top") {
      const { getTopAgentsByBalance } = await import("@/infrastructure/database/queries/agents");
      const agentNames = await getTopAgentsByBalance(
        ARENA_CONFIG.topAgentsCount
      );
      logger.info(
        `Loading top ${ARENA_CONFIG.topAgentsCount} agents by balance:`,
        agentNames
      );
      return agentNames;
    } else {
      const agentNames = Object.values(ARENA_AGENTS);
      logger.info("Loading fixed arena agents:", agentNames);
      return agentNames;
    }
  }

  private async getCachedArenaAgents(): Promise<ArenaAgent[]> {
    const now = Date.now();
    const cacheAge = now - this.cacheTimestamp;

    // Return cached data if still fresh
    if (this.arenaAgentsCache && cacheAge < this.CACHE_TTL) {
      logger.info(
        `Arena cache HIT (age: ${(cacheAge / 1000).toFixed(1)}s / ${
          this.CACHE_TTL / 1000
        }s TTL)`
      );
      return this.arenaAgentsCache;
    }

    // If another request is already fetching, wait for it (prevent duplicate work)
    if (this.inflightFetch) {
      logger.info(
        "Arena cache WAITING - another request is already fetching data"
      );
      return await this.inflightFetch;
    }

    // Cache miss - start new fetch and track promise
    logger.info(
      "Arena cache MISS - fetching fresh data (balance + PnL for all agents)"
    );

    this.inflightFetch = this.getArenaAgents()
      .then((agents) => {
        // Update cache on success
        this.arenaAgentsCache = agents;
        this.cacheTimestamp = Date.now();
        this.inflightFetch = null;
        logger.info(
          `Arena cache updated - ${agents.length} agents cached for ${
            this.CACHE_TTL / 1000
          }s`
        );
        return agents;
      })
      .catch((error) => {
        // Clear inflight on error so next request can retry
        this.inflightFetch = null;
        logger.error("Arena cache fetch failed:", error);
        throw error;
      });

    return await this.inflightFetch;
  }

  async getArenaAgents(): Promise<ArenaAgent[]> {
    const arenaAgents: ArenaAgent[] = [];

    const agentNames = await this.getActiveArenaAgentNames();

    for (const agentName of agentNames) {
      try {
        const dbAgent = await getAgentByNameSystemWide(agentName);

        if (!dbAgent) {
          logger.warn(`Arena agent '${agentName}' not found in database`);
          continue;
        }

        let balance = 0;
        let unRealizedPnl = 0;
        let totalWalletBalance = 0;
        let pnl1d: ArenaAgent["pnl1h"] | undefined;
        let pnl7d: ArenaAgent["pnl7d"] | undefined;

        try {
          const agent = await this.agentManager.hydrate(
            agentName,
            dbAgent.userId
          );
          const accountInfo = await agent?.client.getAccountInfo();

          if (accountInfo) {
            balance = (await agent?.updateBalance()) || 0;
            unRealizedPnl = parseFloat(accountInfo.totalUnrealizedProfit) || 0;
            totalWalletBalance = agent?.balanceInfo.totalWallet || 0;
            logger.info(
              `Live API balance for ${agentName}: ${balance} USDT, Unrealized PnL: ${unRealizedPnl} USDT`
            );
          } else {
            logger.error(
              `Could not load agent ${agentName} - cannot fetch balance`
            );
          }

          // Fetch PnL summary data for 1d and 7d (all agents use V1FuturesClient)
          if (agent?.client) {
            // Fetch 1-day PnL
            try {
              const pnl1dData = await agent.client.getPnLByDays(
                1,
                undefined,
                false
              );
              pnl1d = {
                realizedPnl: pnl1dData.realizedPnL || 0,
                deposits: pnl1dData.deposits || 0,
                withdrawals: pnl1dData.withdrawals || 0,
                commissions: pnl1dData.commissions || 0,
                recordCount: pnl1dData.recordCount || 0,
              };
              logger.debug(
                `PnL 1d for ${agentName}: realized=${pnl1d.realizedPnl}, commissions=${pnl1d.commissions}, records=${pnl1d.recordCount}`
              );
            } catch (pnlError) {
              logger.warn(`Failed to fetch 1d PnL for ${agentName}:`, pnlError);
            }

            // Fetch 7-day PnL
            try {
              const pnl7dData = await agent.client.getPnLByDays(
                7,
                undefined,
                false
              );
              pnl7d = {
                realizedPnl: pnl7dData.realizedPnL || 0,
                deposits: pnl7dData.deposits || 0,
                withdrawals: pnl7dData.withdrawals || 0,
                commissions: pnl7dData.commissions || 0,
                recordCount: pnl7dData.recordCount || 0,
              };
              logger.debug(
                `PnL 7d for ${agentName}: realized=${pnl7d.realizedPnl}, commissions=${pnl7d.commissions}, records=${pnl7d.recordCount}`
              );
            } catch (pnlError) {
              logger.warn(`Failed to fetch 7d PnL for ${agentName}:`, pnlError);
            }
          }
        } catch (balanceError) {
          logger.error(
            `API balance fetch failed for ${agentName}:`,
            balanceError
          );
        }

        // Use real unrealized PnL from account info
        const pnl = unRealizedPnl;
        const pnlPercent =
          totalWalletBalance > 0
            ? (unRealizedPnl / totalWalletBalance) * 100
            : 0;

        const metadata = ARENA_AGENT_METADATA[agentName as ArenaAgentId];

        // Detect template based on systemPrompt AND approach
        const template = detectTemplate(dbAgent.systemPrompt, dbAgent.aiConfig);

        // debugger;
        arenaAgents.push({
          id: agentName, // Use agent name as ID for dynamic agents
          displayName: agentName,
          agentName,
          provider:
            metadata?.provider ||
            (dbAgent.aiConfig as any)?.provider ||
            "unknown",
          model:
            metadata?.model || (dbAgent.aiConfig as any)?.model || "unknown",
          balance: totalWalletBalance,
          pnl,
          pnlPercent,
          color: metadata?.color || this.generateColor(agentName),
          description:
            metadata?.description || dbAgent.systemPrompt || "AI Trading Agent",
          isActive: dbAgent.isActive || false,
          systemPrompt: dbAgent.systemPrompt,
          aiConfig: dbAgent.aiConfig,
          template, // Full template metadata (id, displayName, videoSrc, posterSrc) or null
          pnl1h: pnl1d,
          pnl7d,
        });
      } catch (error) {
        logger.error(`Failed to fetch arena agent '${agentName}':`, error);
      }
    }

    return arenaAgents;
  }

  private generateColor(agentName: string): string {
    const colors = [
      "#00D084", // Green
      "#8B5CF6", // Purple
      "#FF6B35", // Orange
      "#3B82F6", // Blue
      "#EC4899", // Pink
      "#F59E0B", // Yellow
      "#10B981", // Emerald
      "#6366F1", // Indigo
      "#EF4444", // Red
      "#14B8A6", // Teal
    ];

    const hash = agentName
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return colors[hash % colors.length];
  }

  async getBalanceHistory(
    period: string = "24h"
  ): Promise<BalanceHistoryPoint[]> {
    const periodMs =
      ARENA_CONFIG.trackingPeriods[
        period as keyof typeof ARENA_CONFIG.trackingPeriods
      ] || ARENA_CONFIG.trackingPeriods["24h"];

    const now = Date.now();
    const startTime = new Date(now - periodMs);

    try {
      // Import balance snapshot queries
      const { getBalanceHistory: getBalanceHistoryFromDB } = await import(
        "@/infrastructure/database/queries/balanceSnapshots"
      );

      // Fetch snapshots from database (already pivoted by agentId)
      const history = await getBalanceHistoryFromDB({
        startTime,
        endTime: new Date(now),
      });

      return history as unknown as BalanceHistoryPoint[];
    } catch (error) {
      logger.error("Failed to fetch balance history from database:", error);

      // Fallback: return current balances as single point (use cache)
      const agents = await this.getCachedArenaAgents();
      const fallback: any = { timestamp: now };
      for (const agent of agents) {
        fallback[agent.agentName] = agent.balance;
      }
      return [fallback];
    }
  }

  async getArenaPositions(): Promise<{
    positions: ArenaPosition[];
    summary: {
      totalPositions: number;
      byAgent: Record<string, number>;
    };
  }> {
    const allPositions: ArenaPosition[] = [];
    const byAgent: Record<string, number> = {};

    const agentNames = await this.getActiveArenaAgentNames();

    for (const agentName of agentNames) {
      try {
        const dbAgent = await getAgentByNameSystemWide(agentName);
        if (!dbAgent) continue;

        // Load agent via AgentManager (system-wide)
        const agent = await this.agentManager.hydrate(
          agentName,
          dbAgent.userId
        );
        if (!agent) continue;

        // Fetch fresh positions from Aster API
        await agent.updatePositions();

        byAgent[agentName] = agent.positions.length;

        // Match positions to their complete AI decision history
        const positionDecisionMap = await matchPositionsToDecisions(
          agent.positions,
          dbAgent.id,
          agent.client
        );

        // Process positions
        for (const position of agent.positions) {
          const exposure = position.size * position.markPrice;
          const signedExposure =
            position.side === "LONG" ? exposure : -exposure;

          let roiPercent = 0;
          if (position.side === "LONG") {
            roiPercent =
              ((position.markPrice - position.entryPrice) /
                position.entryPrice) *
              1000;
          } else {
            roiPercent =
              ((position.entryPrice - position.markPrice) /
                position.entryPrice) *
              1000;
          }

          // Get ALL AI decisions for this position (BUY/WAIT/WAIT/CLOSE)
          // Find the opening trade's orderId first
          const posAmt = parseFloat(position.positionAmt);
          let positionDecisions: any[] = [];
          let openingDecision = undefined;

          // Try to find decisions by iterating the map
          for (const [orderId, decisions] of positionDecisionMap.entries()) {
            // Check if any decision in this group matches our position
            const matchesSymbol = decisions.some(
              (d) => d.symbol === position.symbol
            );
            if (matchesSymbol) {
              positionDecisions = decisions;
              // Find the opening decision (BUY or SELL)
              openingDecision = decisions.find(
                (d) => d.decisionAction === "buy" || d.decisionAction === "sell"
              );
              break;
            }
          }

          allPositions.push({
            agent: agentName,
            agentName,
            displayName: agentName,
            symbol: position.symbol,
            side: position.side,
            size: position.size,
            entryPrice: position.entryPrice,
            markPrice: position.markPrice,
            unrealizedPnl: position.unrealizedPnl,
            roiPercent,
            exposure,
            signedExposure,
            // Additional position metadata from Aster API
            leverage: position.leverage,
            margin: position.isolatedMargin,
            liquidationPrice: position.liquidationPrice,
            openTime: position.updateTime,
            // AI decision data - from opening decision
            confidence: openingDecision?.decisionConfidence,
            reasoning: openingDecision?.decisionReasoning || undefined,
            orderId: openingDecision?.orderId || undefined,
            // Complete AI decision history for this position (map DB fields to frontend interface)
            aiDecisions:
              positionDecisions.length > 0
                ? positionDecisions
                    .sort(
                      (a: any, b: any) =>
                        new Date(a.timestamp).getTime() -
                        new Date(b.timestamp).getTime()
                    ) // Sort chronologically: oldest → newest
                    .map((d: any) => ({
                      action: d.decisionAction,
                      confidence: d.decisionConfidence,
                      reasoning: d.decisionReasoning,
                      timestamp: d.timestamp,
                      executed: d.executed,
                      executionReason: d.executionReason,
                      agent: agentName,
                      agentName: agentName,
                      displayName: agentName,
                      symbol: d.symbol,
                      tradingCycleId: d.tradingCycleId,
                      llmStats: d.llmStats,
                    }))
                : undefined,
          });
        }
      } catch (error) {
        logger.error(
          `Failed to fetch positions for arena agent '${agentName}':`,
          error
        );
        byAgent[agentName] = 0;
      }
    }

    return {
      positions: allPositions,
      summary: {
        totalPositions: allPositions.length,
        byAgent,
      },
    };
  }

  async getRecentTrades(limit: number = 50): Promise<ArenaTrade[]> {
    const allTrades: ArenaTrade[] = [];
    const rawTrades: any[] = [];
    const tradesByAgent: Map<string, { dbAgent: any; trades: any[] }> =
      new Map();
    const startTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // Last 7 days

    const agentNames = await this.getActiveArenaAgentNames();

    // Step 1: Fetch all trades from API
    for (const agentName of agentNames) {
      try {
        const dbAgent = await getAgentByNameSystemWide(agentName);
        if (!dbAgent) continue;

        const agent = await this.agentManager.hydrate(
          agentName,
          dbAgent.userId
        );
        if (!agent) continue;

        let symbolsToQuery: string[] = [...ARENA_CONFIG.topTokens];
        if ((agent as any).aiConfig?.tradingPairs) {
          symbolsToQuery = (agent as any).aiConfig.tradingPairs;
        }

        const agentTrades: any[] = [];

        // Fetch trades from Aster API for each symbol
        for (const symbol of symbolsToQuery) {
          try {
            const trades = await agent.client.getUserTrades(
              symbol,
              startTime,
              Date.now(),
              limit
            );
            agentTrades.push(...trades);
            rawTrades.push(
              ...trades.map((t: any) => ({
                ...t,
                agentName,
                dbAgentId: dbAgent.id,
              }))
            );
          } catch (error) {
            logger.error(
              `Failed to fetch trades for ${agentName}, symbol ${symbol}:`,
              error
            );
          }
        }

        tradesByAgent.set(agentName, { dbAgent, trades: agentTrades });
      } catch (error) {
        logger.error(
          `Failed to fetch trades for arena agent '${agentName}':`,
          error
        );
      }
    }

    // Step 2: Match trades to AI decisions (per agent)
    for (const [agentName, { dbAgent, trades }] of tradesByAgent.entries()) {
      try {
        const tradeDecisionMap = await matchTradesToDecisions(
          trades,
          dbAgent.id
        );

        trades.forEach((trade: any) => {
          const quantity = parseFloat(trade.qty || trade.quantity || "0");
          const price = parseFloat(trade.price || "0");

          // Get AI decision for this trade
          const decision = tradeDecisionMap.get(trade.orderId.toString());

          allTrades.push({
            id: trade.id,
            agent: agentName,
            agentName,
            displayName: agentName,
            symbol: trade.symbol,
            side: trade.side as "BUY" | "SELL",
            quantity,
            price,
            value: quantity * price,
            commission: parseFloat(trade.commission || "0"),
            timestamp: trade.time || Date.now(),
            tradeTime: new Date(trade.time || Date.now()).toISOString(),
            action: trade.side === "BUY" ? "bought" : "sold",
            // AI decision data
            confidence: decision?.decisionConfidence,
            reasoning: decision?.decisionReasoning,
            // Complete AI decision array (trades have 1:1 mapping, map DB fields to frontend interface)
            aiDecisions: decision
              ? [
                  {
                    action: decision.decisionAction,
                    confidence: decision.decisionConfidence,
                    reasoning: decision.decisionReasoning,
                    timestamp: decision.timestamp,
                    executed: decision.executed,
                    executionReason: (decision as any).executionReason,
                    agent: agentName,
                    agentName: agentName,
                    displayName: agentName,
                    symbol: decision.symbol,
                    tradingCycleId: decision.tradingCycleId,
                    llmStats: (decision as any).llmStats,
                  },
                ]
              : undefined,
          });
        });
      } catch (error) {
        logger.error(
          `Failed to match trades to decisions for ${agentName}:`,
          error
        );
      }
    }

    // Sort by timestamp (newest first) and limit
    return allTrades.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  async getRecentAIDecisions(limit: number = 100): Promise<ArenaDecision[]> {
    const allDecisions: ArenaDecision[] = [];

    const agentNames = await this.getActiveArenaAgentNames();

    for (const agentName of agentNames) {
      try {
        const dbAgent = await getAgentByNameSystemWide(agentName);
        if (!dbAgent) continue;

        const decisions = await getAIDecisionsFiltered({
          agentId: dbAgent.id,
          limit,
        });

        decisions.forEach((decision) => {
          allDecisions.push({
            agent: agentName,
            agentName,
            displayName: agentName,
            symbol: decision.symbol,
            action: decision.decisionAction,
            confidence: decision.decisionConfidence,
            reasoning: decision.decisionReasoning,
            executed: decision.executed,
            executionReason: decision.executionReason || undefined,
            timestamp: decision.timestamp.toISOString(),
            tradingCycleId: decision.tradingCycleId || undefined,
            llmStats: decision.llmStats || undefined,
          });
        });
      } catch (error) {
        logger.error(
          `Failed to fetch AI decisions for arena agent '${agentName}':`,
          error
        );
      }
    }

    // Sort by timestamp (newest first) and limit
    return allDecisions
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);
  }

  async getMarketPrices(): Promise<MarketPrice[]> {
    const prices: MarketPrice[] = [];

    try {
      for (const symbol of ARENA_CONFIG.topTokens) {
        try {
          const marketData = await this.marketDataProvider.getMarketData(
            symbol
          );

          prices.push({
            symbol: marketData.symbol,
            name: symbol.replace("USDT", ""),
            price: marketData.price,
            change24h: marketData.priceChange24h,
            changePercent24h: marketData.priceChangePercent24h,
          });
        } catch (error) {
          logger.error(`Failed to fetch market data for ${symbol}:`, error);
        }
      }
    } catch (error) {
      logger.error("Failed to fetch market prices:", error);
    }

    return prices;
  }

  async getArenaStats(): Promise<ArenaStats> {
    const agents = await this.getCachedArenaAgents();

    const sortedAgents = [...agents].sort((a, b) => b.balance - a.balance);

    const leaderboard = await Promise.all(
      sortedAgents.map(async (agent, index) => {
        try {
          const dbAgent = await getAgentByNameSystemWide(agent.agentName);
          if (!dbAgent) {
            return {
              rank: index + 1,
              agent: agent.id,
              displayName: agent.displayName,
              balance: agent.balance,
              roi: agent.pnlPercent,
              totalTrades: 0,
              winRate: 0,
              color: agent.color,
            };
          }

          const trades = await getUserTrades(dbAgent.userId, {
            agentId: dbAgent.id,
            limit: 10000,
          });

          let profitableTrades = 0;
          for (let i = 1; i < trades.length; i++) {
            const prevTrade = trades[i - 1];
            const currTrade = trades[i];

            if (prevTrade.side === "BUY" && currTrade.side === "SELL") {
              const profit =
                (parseFloat(currTrade.price) - parseFloat(prevTrade.price)) *
                parseFloat(prevTrade.quantity);
              if (profit > 0) profitableTrades++;
            }
          }

          const winRate =
            trades.length > 0 ? (profitableTrades / trades.length) * 100 : 0;

          return {
            rank: index + 1,
            agent: agent.id,
            displayName: agent.displayName,
            balance: agent.balance,
            roi: agent.pnlPercent,
            totalTrades: trades.length,
            winRate,
            color: agent.color,
          };
        } catch (error) {
          logger.error(`Failed to get stats for ${agent.agentName}:`, error);
          return {
            rank: index + 1,
            agent: agent.id,
            displayName: agent.displayName,
            balance: agent.balance,
            roi: agent.pnlPercent,
            totalTrades: 0,
            winRate: 0,
            color: agent.color,
          };
        }
      })
    );

    let totalVolume = 0;
    let totalTrades = 0;

    for (const agent of agents) {
      try {
        const dbAgent = await getAgentByNameSystemWide(agent.agentName);
        if (!dbAgent) continue;

        const trades = await getUserTrades(dbAgent.userId, {
          agentId: dbAgent.id,
          limit: 10000,
        });

        totalTrades += trades.length;
        totalVolume += trades.reduce((sum, trade) => {
          return sum + parseFloat(trade.quantity) * parseFloat(trade.price);
        }, 0);
      } catch (error) {
        logger.error(
          `Failed to calculate volume for ${agent.agentName}:`,
          error
        );
      }
    }

    const startDate = "2025-10-01"; // TODO: Store arena start date in config
    const daysRunning = Math.floor(
      (Date.now() - new Date(startDate).getTime()) / (24 * 60 * 60 * 1000)
    );

    return {
      leaderboard,
      totalVolume,
      totalTrades,
      startDate,
      daysRunning,
    };
  }
}
