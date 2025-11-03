export interface ArenaDecision {
  agent: string; // Dynamic agent ID
  agentName: string;
  displayName: string;
  symbol: string;
  action: "buy" | "sell" | "hold" | "close" | "wait";
  confidence: number;
  reasoning: string;
  executed: boolean;
  executionReason?: string;
  timestamp: string;
  tradingCycleId?: string;
  llmStats?: any;
}
