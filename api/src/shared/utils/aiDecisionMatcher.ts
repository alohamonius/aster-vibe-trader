import { V1FuturesClient } from "@/infrastructure/dex/aster/V1FuturesClient";
import { AsterPosition } from "@/infrastructure/dex/aster/types";
import { db } from "@/infrastructure/database/client";
import { aiDecisions } from "@/infrastructure/database/schema/aiDecisions";
import { eq, and, inArray } from "drizzle-orm";
import { logger } from "./logger";

export interface AIDecision {
  id: string;
  symbol: string;
  decisionAction: string;
  decisionConfidence: number;
  decisionReasoning: string;
  orderId: string | null;
  executed: boolean;
  timestamp: Date;
  tradingCycleId: string | null;
}

/**
 * Match positions to their complete AI decision history
 * Returns a map of opening orderId → all AI decisions for that position
 */
export async function matchPositionsToDecisions(
  positions: AsterPosition[],
  agentId: string,
  futuresClient: V1FuturesClient
): Promise<Map<string, AIDecision[]>> {
  const result = new Map<string, AIDecision[]>();

  if (positions.length === 0) {
    return result;
  }

  try {
    // Step 1: Fetch trades for all position symbols
    const symbols = [...new Set(positions.map((p) => p.symbol))];
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Find oldest position time to optimize query
    const positionTimes = positions.map((p) => p.updateTime || Date.now());
    const oldestPositionTime = Math.min(...positionTimes);

    // Respect 7-day API limit
    const searchFrom = Math.max(
      oldestPositionTime - 24 * 60 * 60 * 1000,
      sevenDaysAgo
    );

    const allTrades: any[] = [];
    for (const symbol of symbols) {
      const trades = await futuresClient.getUserTrades(
        symbol,
        searchFrom,
        now,
        100
      );
      allTrades.push(...trades);
    }

    if (allTrades.length === 0) {
      logger.warn("No trades found for positions");
      return result;
    }

    // Step 2: Fetch AI decisions for these trades (efficient query)
    const orderIds = allTrades.map((t) => t.orderId.toString());
    const decisions = await db
      .select()
      .from(aiDecisions)
      .where(and(eq(aiDecisions.agentId, agentId), inArray(aiDecisions.orderId, orderIds)));

    logger.debug(
      `Found ${decisions.length} AI decisions for ${allTrades.length} trades`
    );

    // Step 3: Match each position to its opening trade and all related decisions
    for (const position of positions) {
      const posAmt = parseFloat(position.positionAmt);
      const expectedTradeSide = posAmt > 0 ? "BUY" : "SELL";
      const posUpdateTime = position.updateTime || Date.now();

      // Find opening trade
      const openingTrades = allTrades
        .filter(
          (t) =>
            t.symbol === position.symbol &&
            t.side === expectedTradeSide &&
            t.time <= posUpdateTime
        )
        .sort((a, b) => b.time - a.time);

      const openingTrade = openingTrades[0];

      if (openingTrade) {
        // Find ALL decisions with this orderId (BUY/WAIT/WAIT/CLOSE)
        const positionDecisions = decisions.filter(
          (d) => d.orderId === openingTrade.orderId.toString()
        );

        if (positionDecisions.length > 0) {
          result.set(openingTrade.orderId.toString(), positionDecisions as any);
          logger.debug(
            `Position ${position.symbol}: ${positionDecisions.length} AI decisions`
          );
        }
      }
    }
  } catch (error) {
    logger.error("Failed to match positions to decisions:", error);
  }

  return result;
}

/**
 * Match trades to their AI decisions
 * Returns a map of orderId → AI decision
 */
export async function matchTradesToDecisions(
  trades: any[],
  agentId: string
): Promise<Map<string, AIDecision>> {
  const result = new Map<string, AIDecision>();

  if (trades.length === 0) {
    return result;
  }

  try {
    // Extract orderIds from trades
    const orderIds = trades.map((t) => t.orderId.toString());

    // Query AI decisions for these orderIds (efficient)
    const decisions = await db
      .select()
      .from(aiDecisions)
      .where(and(eq(aiDecisions.agentId, agentId), inArray(aiDecisions.orderId, orderIds)));

    logger.debug(
      `Matched ${decisions.length}/${trades.length} trades to AI decisions`
    );

    // Build map
    for (const decision of decisions) {
      if (decision.orderId) {
        result.set(decision.orderId, decision as any);
      }
    }
  } catch (error) {
    logger.error("Failed to match trades to decisions:", error);
  }

  return result;
}

/**
 * Get all AI decisions for a specific orderId (complete position history)
 */
export async function getDecisionsByOrderId(
  orderId: string,
  agentId: string
): Promise<AIDecision[]> {
  try {
    const decisions = await db
      .select()
      .from(aiDecisions)
      .where(and(eq(aiDecisions.agentId, agentId), eq(aiDecisions.orderId, orderId)));

    return decisions as any;
  } catch (error) {
    logger.error(`Failed to get decisions for orderId ${orderId}:`, error);
    return [];
  }
}
