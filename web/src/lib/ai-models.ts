import { AIServiceProvider } from "./api";

export interface AIModelOption {
  value: string;
  label: string;
}

export const AI_MODELS: Record<AIServiceProvider, AIModelOption[]> = {
  openai: [
    {
      value: "gpt-4o-mini",
      label: "GPT-4o Mini (Fast & Cost-effective)",
    },
    {
      value: "gpt-4o",
      label: "GPT-4o (Most Capable)",
    },
    {
      value: "gpt-4-turbo",
      label: "GPT-4 Turbo (High Performance)",
    },
  ],
  anthropic: [
    {
      value: "claude-3-5-haiku-20241022",
      label: "Claude 3.5 Haiku (Fast & Affordable)",
    },
    {
      value: "claude-3-5-sonnet-20241022",
      label: "Claude 3.5 Sonnet (Most Intelligent)",
    },
    {
      value: "claude-3-opus-20240229",
      label: "Claude 3 Opus (Premium)",
    },
  ],
  deepseek: [
    {
      value: "deepseek-chat",
      label: "DeepSeek Chat (General Purpose)",
    },
    {
      value: "deepseek-coder",
      label: "DeepSeek Coder (Technical Analysis)",
    },
  ],
  gladiaster: [
    {
      value: "gladiaster-default",
      label: "Gladiaster Default (System Managed)",
    },
  ],
};

export function getAIModels(provider: AIServiceProvider): AIModelOption[] {
  return AI_MODELS[provider] || [];
}

export function getDefaultModel(provider: AIServiceProvider): string {
  const models = getAIModels(provider);
  return models[0]?.value || "";
}
