import axios, { AxiosInstance } from "axios";
import { BaseAIService } from "./BaseAIService";
import { AIServiceConfig, AIServiceResponse } from "@/services/ai/types";
import { logger } from "@/shared/utils/logger";

export class OpenAIClient extends BaseAIService {
  private client: AxiosInstance;
  private readonly availableModels = [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-3.5-turbo",
  ];

  constructor(config: AIServiceConfig) {
    super(config);

    this.client = axios.create({
      baseURL: "https://api.openai.com/v1",
      timeout: 60000,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    // Set default model if not specified
    if (!this.config.model) {
      this.config.model = "gpt-4o-mini"; // Cost-effective default
    }

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use((config) => {
      logger.debug("OpenAI API Request:", {
        url: config.url,
        method: config.method,
        model: this.config.model,
      });
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        logger.debug("OpenAI API Response:", {
          status: response.status,
          usage: response.data.usage,
        });
        return response;
      },
      (error) => {
        logger.error("OpenAI API Error:", {
          status: error.response?.status,
          message: error.response?.data?.error?.message || error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  public async analyzeWithPrompt(
    prompt: string
  ): Promise<AIServiceResponse<string>> {
    try {
      const systemPrompt =
        this.config.systemPrompt ||
        "You are an expert cryptocurrency trader and technical analyst. Analyze the provided market data and provide trading signals in CSV format as requested.";

      const response = await this.client.post("/chat/completions", {
        model: this.config.model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: this.config.maxTokens || 6000,
        temperature: this.config.temperature || 0.3,
      });

      const aiResponse = response.data.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error("No response content from OpenAI");
      }

      return {
        success: true,
        data: aiResponse,
        tokens: response.data.usage
          ? {
              prompt: response.data.usage.prompt_tokens,
              completion: response.data.usage.completion_tokens,
              total: response.data.usage.total_tokens,
            }
          : undefined,
        provider: "openai",
        model: this.config.model || "unknown",
      };
    } catch (error: any) {
      logger.error("OpenAI prompt analysis failed:", error);

      return {
        success: false,
        error:
          error.response?.data?.error?.message ||
          error.message ||
          "OpenAI request failed",
        provider: "openai",
        model: this.config.model || "unknown",
      };
    }
  }

  public async validateConnection(): Promise<boolean> {
    try {
      const response = await this.client.get("/models");
      return response.status === 200 && Array.isArray(response.data.data);
    } catch (error) {
      logger.error("OpenAI connection validation failed:", error);
      return false;
    }
  }

  public getAvailableModels(): string[] {
    return [...this.availableModels];
  }

  /**
   * Get current model pricing and limits
   */
  public getModelInfo(modelName?: string): any {
    const model = modelName || this.config.model;

    const modelInfo: Record<string, any> = {
      "gpt-4o": {
        inputCost: 0.005, // per 1K tokens
        outputCost: 0.015,
        contextLength: 128000,
        description: "Most capable model, best for complex analysis",
      },
      "gpt-4o-mini": {
        inputCost: 0.00015,
        outputCost: 0.0006,
        contextLength: 128000,
        description: "Fast and cost-effective, good for routine analysis",
      },
      "gpt-4-turbo": {
        inputCost: 0.01,
        outputCost: 0.03,
        contextLength: 128000,
        description: "High performance, good balance of cost and capability",
      },
      "gpt-3.5-turbo": {
        inputCost: 0.0005,
        outputCost: 0.0015,
        contextLength: 16385,
        description: "Legacy model, most cost-effective option",
      },
    };

    return modelInfo[model || ""] || { description: "Unknown model" };
  }
}
