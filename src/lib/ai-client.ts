import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { ModelProvider, ModelInfo } from './models';
import modelRouter from './model-router';
import { streamText } from 'ai';

// API keys would be stored securely in environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'dummy-key-for-dev';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'dummy-key-for-dev';
const DEFAULT_MODEL = 'openai/gpt-3.5-turbo';

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

interface AIClientOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  functions?: any[];
  tools?: any[];
}

export class AIClient {
  private static instance: AIClient;

  private constructor() {}

  public static getInstance(): AIClient {
    if (!AIClient.instance) {
      AIClient.instance = new AIClient();
    }
    return AIClient.instance;
  }

  /**
   * Gets the appropriate client based on the model provider
   */
  private getClientForModel(modelId: string): any {
    const [provider] = modelId.split('/');
    
    switch (provider) {
      case 'openai':
        return openai;
      case 'anthropic':
        return anthropic;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Maps the model ID to the actual model name expected by the provider
   */
  private mapModelId(modelId: string): string {
    const [provider, model] = modelId.split('/');
    
    // For OpenAI, we just use the model name
    if (provider === 'openai') {
      return model;
    }
    
    // For Anthropic models
    if (provider === 'anthropic') {
      return model;
    }
    
    // Default fallback - just use the model part
    return model;
  }

  /**
   * Generate completions with intelligent routing and fallbacks
   */
  public async complete(
    messages: Message[],
    requestedModel: string,
    options: AIClientOptions = {}
  ) {
    try {
      // Use the model router to determine the actual model to use (with fallbacks)
      const modelRequest = {
        model: requestedModel,
        messages,
        ...options
      };
      
      const actualModelId = await modelRouter.routeRequest(modelRequest);
      
      // Get the provider client based on model
      const client = this.getClientForModel(actualModelId);
      const mappedModel = this.mapModelId(actualModelId);
      
      // Create completion based on provider
      const [provider] = actualModelId.split('/');
      
      if (provider === 'openai') {
        return await this.completeWithOpenAI(client, mappedModel, messages, options);
      } else if (provider === 'anthropic') {
        return await this.completeWithAnthropic(client, mappedModel, messages, options);
      } else {
        throw new Error(`Provider ${provider} not implemented`);
      }
      
    } catch (error) {
      console.error('Error in AI completion:', error);
      throw error;
    }
  }

  /**
   * Generate completions with OpenAI
   */
  private async completeWithOpenAI(
    client: any,
    model: string,
    messages: Message[],
    options: AIClientOptions
  ) {
    const { temperature = 0.7, maxTokens, stream = false, functions, tools } = options;
    
    const completion = await client.chat({
      model,
      messages,
      temperature,
      maxTokens,
      stream,
      ...(functions ? { functions } : {}),
      ...(tools ? { tools } : {})
    });
    
    return {
      provider: 'openai',
      model,
      completion,
      usage: completion.usage
    };
  }

  /**
   * Generate completions with Anthropic
   */
  private async completeWithAnthropic(
    client: any,
    model: string,
    messages: Message[],
    options: AIClientOptions
  ) {
    const { temperature = 0.7, maxTokens, stream = false, tools } = options;
    
    const completion = await client.messages({
      model,
      messages,
      temperature,
      maxTokens,
      stream,
      ...(tools ? { tools } : {})
    });
    
    return {
      provider: 'anthropic',
      model,
      completion,
      usage: completion.usage
    };
  }

  /**
   * Create a streaming AI response
   */
  public async stream(
    messages: Message[],
    requestedModel: string,
    options: AIClientOptions = {}
  ) {
    // Always enable streaming
    return this.complete(messages, requestedModel, { ...options, stream: true });
  }

  /**
   * Execute function calling or tool use
   */
  public async executeWithTools(
    messages: Message[],
    requestedModel: string,
    tools: any[],
    options: AIClientOptions = {}
  ) {
    return this.complete(messages, requestedModel, { ...options, tools });
  }
}

export default AIClient.getInstance();
