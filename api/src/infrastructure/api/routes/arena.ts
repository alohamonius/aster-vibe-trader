import { Router, Request, Response } from "express";
import { ArenaService } from "../services/ArenaService";
import { asyncHandler } from "../middleware/errorHandler";
import { cacheMiddleware } from "../middleware/cache";
import { logger } from "@/shared/utils/logger";
import { ARENA_CONFIG } from "@/shared/config/arena";

const router = Router();
const arenaService = ArenaService.getInstance();

// Cache TTL for arena endpoints (5 minutes - matches service cache)
const ARENA_CACHE_TTL = 300000;

/**
 * GET /api/arena/agents
 * Get all arena agents with current stats
 * Public endpoint - no authentication required
 */
router.get(
  "/agents",
  cacheMiddleware(ARENA_CACHE_TTL),
  asyncHandler(async (req: Request, res: Response) => {
    logger.info("Fetching arena agents");

    const agents = await arenaService.getArenaAgents();

    res.json({
      success: true,
      data: {
        agents,
        count: agents.length,
      },
    });
  })
);

/**
 * GET /api/arena/balances/history
 * Get balance history for all arena agents over time
 * Query params: period (1h|24h|7d|30d, default: 24h)
 * Public endpoint - no authentication required
 */
router.get(
  "/balances/history",
  cacheMiddleware(ARENA_CACHE_TTL),
  asyncHandler(async (req: Request, res: Response) => {
    const { period = ARENA_CONFIG.defaultPeriod } = req.query;

    logger.info(`Fetching arena balance history for period: ${period}`);

    // Validate period
    const validPeriods = Object.keys(ARENA_CONFIG.trackingPeriods);
    if (!validPeriods.includes(period as string)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid period. Must be one of: ${validPeriods.join(', ')}`,
          type: "ValidationError",
        },
      });
    }

    const history = await arenaService.getBalanceHistory(period as string);

    res.json({
      success: true,
      data: {
        period,
        dataPoints: history.length,
        history,
      },
    });
  })
);

/**
 * GET /api/arena/positions
 * Get current positions for all arena agents
 * Public endpoint - no authentication required
 */
router.get(
  "/positions",
  cacheMiddleware(ARENA_CACHE_TTL),
  asyncHandler(async (req: Request, res: Response) => {
    logger.info("Fetching arena positions");

    const result = await arenaService.getArenaPositions();

    res.json({
      success: true,
      data: result,
    });
  })
);

/**
 * GET /api/arena/trades/recent
 * Get recent trades for all arena agents
 * Query params: limit (default: 50, max: 100)
 * Public endpoint - no authentication required
 */
router.get(
  "/trades/recent",
  cacheMiddleware(ARENA_CACHE_TTL),
  asyncHandler(async (req: Request, res: Response) => {
    const { limit = ARENA_CONFIG.defaultTradeLimit } = req.query;

    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Limit must be a number between 1 and 100",
          type: "ValidationError",
        },
      });
    }

    logger.info(`Fetching recent arena trades (limit: ${limitNum})`);

    const trades = await arenaService.getRecentTrades(limitNum);

    res.json({
      success: true,
      data: {
        trades,
        count: trades.length,
      },
    });
  })
);

/**
 * GET /api/arena/ai-decisions/recent
 * Get recent AI decisions (buy/sell/hold) for all arena agents
 * Query params: limit (default: 100, max: 200)
 * Public endpoint - no authentication required
 */
router.get(
  "/ai-decisions/recent",
  cacheMiddleware(ARENA_CACHE_TTL),
  asyncHandler(async (req: Request, res: Response) => {
    const { limit = ARENA_CONFIG.defaultDecisionLimit } = req.query;

    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 200) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Limit must be a number between 1 and 200",
          type: "ValidationError",
        },
      });
    }

    logger.info(`Fetching recent arena AI decisions (limit: ${limitNum})`);

    const decisions = await arenaService.getRecentAIDecisions(limitNum);

    res.json({
      success: true,
      data: {
        decisions,
        count: decisions.length,
      },
    });
  })
);

/**
 * GET /api/arena/market/prices
 * Get top token prices from Aster DEX
 * Public endpoint - no authentication required
 */
router.get(
  "/market/prices",
  cacheMiddleware(ARENA_CACHE_TTL),
  asyncHandler(async (req: Request, res: Response) => {
    logger.info("Fetching arena market prices");

    const prices = await arenaService.getMarketPrices();

    res.json({
      success: true,
      data: {
        prices,
        count: prices.length,
        timestamp: Date.now(),
      },
    });
  })
);

/**
 * GET /api/arena/stats
 * Get arena statistics and leaderboard
 * Public endpoint - no authentication required
 */
router.get(
  "/stats",
  cacheMiddleware(ARENA_CACHE_TTL),
  asyncHandler(async (req: Request, res: Response) => {
    logger.info("Fetching arena stats");

    const stats = await arenaService.getArenaStats();

    res.json({
      success: true,
      data: stats,
    });
  })
);

/**
 * GET /api/arena/config
 * Get arena configuration (for frontend reference)
 * Public endpoint - no authentication required
 */
router.get(
  "/config",
  cacheMiddleware(60000), // 60 seconds cache for static config
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        startingCapital: ARENA_CONFIG.startingCapital,
        trackingPeriods: Object.keys(ARENA_CONFIG.trackingPeriods),
        defaultPeriod: ARENA_CONFIG.defaultPeriod,
        updateInterval: ARENA_CONFIG.updateInterval,
        topTokens: ARENA_CONFIG.topTokens,
      },
    });
  })
);

export { router as arenaRoutes };
