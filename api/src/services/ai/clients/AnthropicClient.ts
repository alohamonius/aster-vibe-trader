import axios, { AxiosInstance } from "axios";
import { BaseAIService } from "./BaseAIService";
import { AIServiceConfig, AIServiceResponse } from "@/services/ai/types";
import { logger } from "@/shared/utils/logger";

export class AnthropicClient extends BaseAIService {
  private client: AxiosInstance;
  private readonly availableModels = [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
  ];

  constructor(config: AIServiceConfig) {
    super(config);

    this.client = axios.create({
      baseURL: "https://api.anthropic.com/v1",
      timeout: 60000,
      headers: {
        "x-api-key": config.apiKey,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
    });

    // Set default model if not specified
    if (!this.config.model) {
      this.config.model = "claude-3-5-haiku-20241022"; // Fast and cost-effective default
    }

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use((config) => {
      logger.debug("Anthropic API Request:", {
        url: config.url,
        method: config.method,
        model: this.config.model,
      });
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        logger.debug("Anthropic API Response:", {
          status: response.status,
          usage: response.data.usage,
        });
        return response;
      },
      (error) => {
        logger.error("Anthropic API Error:", {
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

      const response = await this.client.post("/messages", {
        model: this.config.model,
        max_tokens: this.config.maxTokens || 6000,
        temperature: this.config.temperature || 0.3,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const aiResponse = response.data.content[0]?.text;
      if (!aiResponse) {
        throw new Error("No response content from Anthropic");
      }

      return {
        success: true,
        data: aiResponse,
        tokens: response.data.usage
          ? {
              prompt: response.data.usage.input_tokens,
              completion: response.data.usage.output_tokens,
              total:
                response.data.usage.input_tokens +
                response.data.usage.output_tokens,
            }
          : undefined,
        provider: "anthropic",
        model: this.config.model || "unknown",
      };
    } catch (error: any) {
      logger.error("Anthropic prompt analysis failed:", error);

      return {
        success: false,
        error:
          error.response?.data?.error?.message ||
          error.message ||
          "Anthropic request failed",
        provider: "anthropic",
        model: this.config.model || "unknown",
      };
    }
  }

  public async validateConnection(): Promise<boolean> {
    try {
      // Test with a simple message
      const response = await this.client.post("/messages", {
        model: this.config.model,
        max_tokens: 10,
        messages: [
          {
            role: "user",
            content: "Hello",
          },
        ],
      });

      return (
        response.status === 200 &&
        response.data.content &&
        response.data.content.length > 0
      );
    } catch (error) {
      logger.error("Anthropic connection validation failed:", error);
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
      "claude-3-5-sonnet-20241022": {
        inputCost: 0.003, // per 1K tokens
        outputCost: 0.015,
        contextLength: 200000,
        description:
          "Most intelligent model, excellent for complex trading analysis",
      },
      "claude-3-5-haiku-20241022": {
        inputCost: 0.0008,
        outputCost: 0.004,
        contextLength: 200000,
        description: "Fast and cost-effective, good for routine analysis",
      },
      "claude-3-opus-20240229": {
        inputCost: 0.015,
        outputCost: 0.075,
        contextLength: 200000,
        description: "Most capable model, best for complex analysis (legacy)",
      },
      "claude-3-sonnet-20240229": {
        inputCost: 0.003,
        outputCost: 0.015,
        contextLength: 200000,
        description: "Balanced performance and cost (legacy)",
      },
      "claude-3-haiku-20240307": {
        inputCost: 0.00025,
        outputCost: 0.00125,
        contextLength: 200000,
        description: "Fastest and most cost-effective (legacy)",
      },
    };

    return modelInfo[model || ""] || { description: "Unknown model" };
  }
}
