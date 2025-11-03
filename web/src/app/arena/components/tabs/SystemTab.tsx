'use client';

import type { ArenaAgent } from '@/lib/arenaApi';

interface SystemTabProps {
  agent: ArenaAgent;
  agentColor: string;
}

export function SystemTab({ agent, agentColor }: SystemTabProps) {
  // Extract trading pairs and leverages
  const tradingPairs = agent.aiConfig?.tradingPairs || agent.aiConfig?.pairs || [];
  const symbolLeverages = agent.aiConfig?.symbolLeverages || {};

  return (
    <div className="space-y-3 text-xs">
      {/* Trading Pairs & Leverage - PRIORITY */}
      {tradingPairs.length > 0 && (
        <div className="border-l-2 pl-2 py-1.5" style={{ borderColor: agentColor }}>
          <div className="text-[var(--arena-text-dim)] text-[10px] mb-1.5">
            Trading Pairs ({tradingPairs.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tradingPairs.map((pair: string) => {
              const leverage = symbolLeverages[pair] || 1;
              return (
                <div
                  key={pair}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
                  style={{
                    backgroundColor: `${agentColor}20`,
                    color: agentColor,
                    border: `1px solid ${agentColor}40`
                  }}
                >
                  {pair.replace('USDT', '')} {leverage}x
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Model Configuration */}
      <div className="border-l-2 pl-2 py-1.5 space-y-1" style={{ borderColor: agentColor }}>
        <div className="text-[var(--arena-text-dim)] text-[10px] mb-1">AI Model</div>
        <div className="text-[var(--arena-text)] font-mono text-xs font-semibold">
          {agent.aiConfig?.provider || agent.provider} | {agent.aiConfig?.model || agent.model}
        </div>
        {(agent.aiConfig?.temperature !== undefined || agent.aiConfig?.maxTokens !== undefined) && (
          <div className="text-[var(--arena-text-dim)] text-[10px] font-mono space-x-2">
            {agent.aiConfig?.temperature !== undefined && (
              <span>
                Temp: <span className="text-[var(--arena-text)]">{agent.aiConfig.temperature}</span>
              </span>
            )}
            {agent.aiConfig?.maxTokens !== undefined && (
              <span>
                Tokens: <span className="text-[var(--arena-text)]">{agent.aiConfig.maxTokens.toLocaleString()}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* System Prompt */}
      <div className="border-l-2 pl-2 py-1.5" style={{ borderColor: agentColor }}>
        <div className="text-[var(--arena-text-dim)] text-[10px] mb-1">System Prompt</div>
        <div className="text-[var(--arena-text)] text-[10px] leading-relaxed max-h-32 overflow-y-auto bg-[var(--arena-border)] bg-opacity-30 rounded p-2">
          {agent.systemPrompt || 'Default system prompt'}
        </div>
      </div>

      {/* Trading Philosophy */}
      {agent.aiConfig?.weightStrategy?.tradingPhilosophy?.approach && (
        <div className="border-l-2 pl-2 py-1.5" style={{ borderColor: agentColor }}>
          <div className="text-[var(--arena-text-dim)] text-[10px] mb-1">Trading Philosophy</div>
          <div className="text-[var(--arena-text)] text-[10px] leading-relaxed bg-[var(--arena-border)] bg-opacity-30 rounded p-2">
            {agent.aiConfig.weightStrategy.tradingPhilosophy.approach}
          </div>
        </div>
      )}

      {/* Trading Parameters (if available) */}
      {(agent.aiConfig?.riskTolerance || agent.aiConfig?.analysisFrequency || agent.aiConfig?.minConfidence) && (
        <div className="border-l-2 pl-2 py-1.5" style={{ borderColor: agentColor }}>
          <div className="text-[var(--arena-text-dim)] text-[10px] mb-1">Trading Parameters</div>
          <div className="space-y-1 text-[10px] font-mono">
            {agent.aiConfig.riskTolerance && (
              <div className="text-[var(--arena-text-dim)]">
                Risk: <span className="text-[var(--arena-text)]">{agent.aiConfig.riskTolerance}</span>
              </div>
            )}
            {agent.aiConfig.analysisFrequency && (
              <div className="text-[var(--arena-text-dim)]">
                Frequency: <span className="text-[var(--arena-text)]">{agent.aiConfig.analysisFrequency}s</span>
              </div>
            )}
            {agent.aiConfig.minConfidence && (
              <div className="text-[var(--arena-text-dim)]">
                Min Confidence: <span className="text-[var(--arena-text)]">{agent.aiConfig.minConfidence}%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
