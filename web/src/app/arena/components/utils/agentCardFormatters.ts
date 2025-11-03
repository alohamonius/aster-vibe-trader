/**
 * Utility functions for AgentCard component
 */

export const getLogoPath = (agentId: string): string => {
  const logoMap: Record<string, string> = {
    chatgpt: '/gpt.svg',
    deepseek: '/deepseek.svg',
    claude: '/claude.svg',
  };
  return logoMap[agentId] || '/gpt.svg';
};

export const formatBalance = (balance: number | undefined | null | string): string => {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (num === null || num === undefined || isNaN(num)) {
    return '0.00';
  }
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatPnL = (pnl: number | undefined | null | string): string => {
  const num = typeof pnl === 'string' ? parseFloat(pnl) : pnl;
  if (num === null || num === undefined || isNaN(num)) {
    return '+$0.00';
  }
  const sign = num >= 0 ? '+' : '';
  return `${sign}$${Math.abs(num).toFixed(2)}`;
};

export const formatTime = (timestamp: number | string): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatTimeAgo = (timestamp: string | number, currentTime?: number): string => {
  const date = new Date(timestamp);
  const now = currentTime || Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 0) return `${seconds}s ago`;
  return 'just now';
};

export const renderValue = (value: any): string => {
  if (value === null || value === undefined) return 'N/A';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};
