import { AIServiceProvider } from "@/lib/api";
import { WeightStrategy } from "./strategy";

export interface AIConfig {
  provider: AIServiceProvider;
  apiKey: string;
  model?: string;
  systemPrompt?: string; // Custom system prompt for AI personality
  maxTokens?: number; // Maximum response length (default: 1000)
  temperature?: number; // AI creativity/randomness (0.0-1.0, default: 0.3)
  indicatorIntervals: Record<string, string[]>; // Per-indicator intervals (e.g., { rsi: ["5m", "1h"], macd: ["1h", "4h"] })
  riskTolerance: "conservative" | "moderate" | "aggressive";
  analysisFrequency: number;
  minConfidence: number;
  pairs: string[];
  // Per-symbol leverage configuration (Aster DEX requires per-symbol leverage)
  symbolLeverages: { [symbol: string]: number }; // 1-125x per symbol
  weightStrategy?: WeightStrategy;
  // Template metadata for displaying avatar in summary
  selectedTemplate?: {
    id: string;
    name: string;
    videoSrc: string;
    posterSrc: string;
    emoji: string;
    riskLevel: number;
  };
}
