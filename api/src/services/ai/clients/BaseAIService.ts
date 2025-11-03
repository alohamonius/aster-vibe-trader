import { AIServiceConfig, AIServiceResponse } from "@/services/ai/types";

export abstract class BaseAIService {
  protected config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  public abstract analyzeWithPrompt(
    prompt: string
  ): Promise<AIServiceResponse<string>>;

  public abstract validateConnection(): Promise<boolean>;

  public abstract getAvailableModels(): string[];
}
