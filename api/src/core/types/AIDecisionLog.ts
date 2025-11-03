import { AIServiceProvider } from "@/shared/types";

export interface AIDecisionLog {
  id: string;
  userId: string;
  agentId: string;
  botId?: string;
  symbol: string;
  timestamp: Date;
  aiProvider: AIServiceProvider;
  aiModel: string;
  indicatorData: Record<string, any>;
  decision: {
    action: "buy" | "sell" | "hold";
    confidence: number;
    reasoning: string;
    suggestedSize: number;
    riskLevel: "low" | "medium" | "high";
  };
  executed: boolean;
  executionReason?: string;
}
