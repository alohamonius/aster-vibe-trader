import { TemplateMetadata } from "@/shared/utils/detectTemplate";

export interface ArenaAgent {
  id: string; // Agent name or ID (can be dynamic)
  displayName: string;
  agentName: string;
  provider: string;
  model: string;
  balance: number;
  pnl: number;
  pnlPercent: number;
  color: string;
  description: string;
  isActive: boolean;
  systemPrompt: string | null;
  aiConfig: any;
  template: TemplateMetadata | null; // Detected template with full metadata
  // PnL Summary data for different time periods
  pnl1h?: {
    // Actually 1-day data (named pnl1h for backwards compatibility)
    realizedPnl: number;
    deposits: number;
    withdrawals: number;
    commissions: number;
    recordCount: number;
  };
  pnl7d?: {
    realizedPnl: number;
    deposits: number;
    withdrawals: number;
    commissions: number;
    recordCount: number;
  };
}
