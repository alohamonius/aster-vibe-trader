export interface TradingSignal {
  symbol: string;
  action: "BUY" | "SELL" | "HOLD" | "WAIT" | "CLOSE";
  quantity: number;
  confidence: number; // 0-100
  reasoning: string;
  timestamp: number;
  aiProvider?: string;
  aiModel?: string;
}

export interface SignalBatch {
  agentName: string;
  timestamp: number;
  signals: TradingSignal[];
  marketContext: {
    totalSymbols: number;
    dataTimestamp: number;
  };
}

export interface ProcessedSignal extends TradingSignal {
  processed: boolean;
  processedAt?: number;
  processingAction: "APPROVED" | "EXECUTED" | "IGNORED" | "REJECTED";
  rejectionReason?: string;
  // Execution attempt results
  executionAttempted?: boolean;
  executionSuccess?: boolean;
  executionError?: string;
  // Order response details (if successful)
  orderId?: string;
  executedQuantity?: number;
  executedPrice?: number;
  fees?: number;
}
