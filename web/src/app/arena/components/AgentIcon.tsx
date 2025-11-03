import { Bot, Brain, Sparkles } from 'lucide-react';

interface AgentIconProps {
  agentId: 'chatgpt' | 'deepseek' | 'claude';
  size?: number;
  className?: string;
}

export function AgentIcon({ agentId, size = 24, className = '' }: AgentIconProps) {
  const icons = {
    chatgpt: <Sparkles size={size} className={className} />,
    deepseek: <Brain size={size} className={className} />,
    claude: <Bot size={size} className={className} />
  };

  return icons[agentId] || <Bot size={size} className={className} />;
}
