import { WeightStrategy } from "@/core/types/WeightStrategy";
import { AIServiceProvider } from "@/services/ai/types";

/**
 * AI Trading Configuration
 * This is the single source of truth for AI trading configuration
 * Stored in database as agents.aiConfig (JSONB column)
 */

export interface AITradingConfig {
  provider: AIServiceProvider;
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string; // Custom system prompt for AI personality
  riskTolerance: "conservative" | "moderate" | "aggressive";
  tradingPairs: string[];
  symbolLeverages: { [symbol: string]: number }; // 1-125x per symbol
  indicatorIntervals: Record<string, string[]>; // Per-indicator intervals (e.g., { rsi: ["5m", "1h"], macd: ["1h", "4h"] })
  analysisFrequency: number;
  minConfidenceThreshold: number;
  maxPositionSize: number;
  weightStrategy: WeightStrategy;
}
