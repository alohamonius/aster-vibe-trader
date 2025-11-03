import { TradingSignal, ProcessedSignal } from "./TradingSignal";
import { CombinedMarketData } from "./trading/models/MarketData";

export interface AIDecision {
  id: string;
  agentName: string;
  timestamp: number;
  symbol: string;
  signal: TradingSignal;
  processedSignal?: ProcessedSignal;
  action: "APPROVED" | "EXECUTED" | "IGNORED" | "REJECTED";
  reason: string;
  marketContext: CombinedMarketData;
  aiProvider: string;
  aiModel: string;
  executionDetails?: {
    orderId?: string;
    executedQuantity?: number;
    executedPrice?: number;
    fees?: number;
  };
}

export interface AIPerformanceMetrics {
  agentName: string;
  timeframe: {
    start: number;
    end: number;
  };
  totalSignals: number;
  executedSignals: number;
  ignoredSignals: number;
  rejectedSignals: number;
  executionRate: number; // percentage
  avgConfidence: number;
  profitLoss: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  sharpeRatio?: number;
}
