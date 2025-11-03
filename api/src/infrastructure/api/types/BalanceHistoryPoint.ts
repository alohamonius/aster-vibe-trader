export interface BalanceHistoryPoint {
  timestamp: number;
  [agentId: string]: number; // Dynamic agent IDs with their balances
}
