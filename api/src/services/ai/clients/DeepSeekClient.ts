import axios, { AxiosInstance } from "axios";
import { BaseAIService } from "./BaseAIService";
import { AIServiceConfig, AIServiceResponse } from "@/services/ai/types";
import { logger } from "@/shared/utils/logger";

export class DeepSeekClient extends BaseAIService {
  private client: AxiosInstance;
  private readonly availableModels = ["deepseek-chat", "deepseek-coder"];

  constructor(config: AIServiceConfig) {
    super(config);

    this.client = axios.create({
      baseURL: "https://api.deepseek.com/v1",
      timeout: 60000,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    // Set default model if not specified
    if (!this.config.model) {
      this.config.model = "deepseek-chat"; // General purpose model
    }

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use((config) => {
      logger.debug("DeepSeek API Request:", {
        url: config.url,
        method: config.method,
        model: this.config.model,
      });
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        logger.debug("DeepSeek API Response:", {
          status: response.status,
          usage: response.data.usage,
        });
        return response;
      },
      (error) => {
        logger.error("DeepSeek API Error:", {
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
        throw new Error("No response content from DeepSeek");
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
        provider: "deepseek",
        model: this.config.model || "unknown",
      };
    } catch (error: any) {
      logger.error("DeepSeek prompt analysis failed:", error);

      return {
        success: false,
        error:
          error.response?.data?.error?.message ||
          error.message ||
          "DeepSeek request failed",
        provider: "deepseek",
        model: this.config.model || "unknown",
      };
    }
  }

  public async validateConnection(): Promise<boolean> {
    try {
      const response = await this.client.get("/models");
      return response.status === 200 && Array.isArray(response.data.data);
    } catch (error) {
      logger.error("DeepSeek connection validation failed:", error);
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
      "deepseek-chat": {
        inputCost: 0.00014, // per 1K tokens (very cost-effective)
        outputCost: 0.00028,
        contextLength: 32768,
        description: "General purpose model, excellent value for money",
      },
      "deepseek-coder": {
        inputCost: 0.00014,
        outputCost: 0.00028,
        contextLength: 16384,
        description: "Code-focused model, good for technical analysis",
      },
    };

    return modelInfo[model || ""] || { description: "Unknown model" };
  }
}
