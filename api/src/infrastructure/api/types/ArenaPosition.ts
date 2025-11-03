export interface ArenaPosition {
  agent: string; // Dynamic agent ID
  agentName: string;
  displayName: string;
  symbol: string;
  side: "LONG" | "SHORT";
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  roiPercent: number;
  exposure: number;
  signedExposure: number;
  // Additional position metadata
  leverage?: number;
  margin?: number;
  liquidationPrice?: number;
  openTime?: number;
  // AI decision data
  confidence?: number;
  reasoning?: string;
  exitStrategy?: string;
  orderId?: string;
  tpOrderId?: string;
  // Complete AI decision history (BUY → WAIT → WAIT → CLOSE)
  aiDecisions?: any[];
}
