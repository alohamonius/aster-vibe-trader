export const AI_PROVIDERS = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  DEEPSEEK: "deepseek",
  GLADIASTER: "gladiaster", // Custom wrapper for easy onboarding
} as const;

export type AIServiceProvider =
  (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS];
export function isValidProvider(value: string): value is AIServiceProvider {
  return Object.values(AI_PROVIDERS).includes(value as AIServiceProvider);
}

export interface AIServiceConfig {
  provider: AIServiceProvider;
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string; // Custom system prompt for AI personality
}

export interface AIServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  provider: AIServiceProvider;
  model: string;
}
