import { models, ModelInfo, ModelRequest, getModelById, getRecommendedFallbacks } from './models';

export type RoutingStrategy = 'default' | 'fallback' | 'lowest-cost' | 'fastest' | 'highest-quality';

interface RoutingOptions {
  timeout?: number; // Timeout in milliseconds
  retries?: number; // Number of retries
  requireAllFeatures?: boolean; // If true, only route to models that support all requested features
}

export class ModelRouter {
  // Singleton pattern
  private static instance: ModelRouter;

  private constructor() {}

  public static getInstance(): ModelRouter {
    if (!ModelRouter.instance) {
      ModelRouter.instance = new ModelRouter();
    }
    return ModelRouter.instance;
  }

  /**
   * Determine the appropriate model based on the routing strategy
   */
  public async routeRequest(
    request: ModelRequest, 
    options: RoutingOptions = { timeout: 5000, retries: 3, requireAllFeatures: false }
  ): Promise<string> {
    const { model, route = 'default', fallbacks = [] } = request;
    
    // Extract required features from request
    const requiredFeatures = this.getRequiredFeatures(request);
    
    switch (route) {
      case 'fallback':
        return this.handleFallbackRouting(model, fallbacks, requiredFeatures, options);
      case 'lowest-cost':
        return this.findLowestCostModel(request, requiredFeatures, options);
      case 'fastest':
        return this.findFastestModel(request, requiredFeatures, options);
      case 'highest-quality':
        return this.findHighestQualityModel(request, requiredFeatures, options);
      case 'default':
      default:
        // If model is available and supports required features, use it
        if (await this.isModelAvailable(model, options)) {
          // Check if model supports all required features
          if (this.modelSupportsFeatures(model, requiredFeatures)) {
            return model;
          }
          
          // If not, try to find a suitable model based on recommended fallbacks
          return this.handleFallbackRouting(model, this.getRecommendedFallbacksForFeatures(model, requiredFeatures), requiredFeatures, options);
        }
        
        // If model is unavailable, use fallbacks or recommended fallbacks
        return this.handleFallbackRouting(
          model,
          fallbacks.length > 0 ? fallbacks : getRecommendedFallbacks(model),
          requiredFeatures,
          options
        );
    }
  }

  /**
   * Check if a model is currently available
   */
  private async isModelAvailable(modelId: string, options: RoutingOptions): Promise<boolean> {
    // In a real implementation, this would check the actual availability through an API call
    // For now, we'll simulate availability with a 95% chance of being available
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 95% availability for most models, except a few with lower availability
        const lowAvailabilityModels = ['openai/gpt-4', 'anthropic/claude-3-opus'];
        const availability = lowAvailabilityModels.includes(modelId) ? 0.8 : 0.95;
        resolve(Math.random() < availability);
      }, 100); // Simulate network delay
    });
  }

  /**
   * Try models in sequence until one is available
   */
  private async handleFallbackRouting(
    primaryModel: string, 
    fallbacks: string[], 
    requiredFeatures: Set<keyof ModelInfo['supportedFeatures']>,
    options: RoutingOptions
  ): Promise<string> {
    // Try the primary model first
    if (await this.isModelAvailable(primaryModel, options) && 
        this.modelSupportsFeatures(primaryModel, requiredFeatures)) {
      return primaryModel;
    }

    // Then try each fallback in sequence
    for (const fallbackModel of fallbacks) {
      if (await this.isModelAvailable(fallbackModel, options) && 
          this.modelSupportsFeatures(fallbackModel, requiredFeatures)) {
        return fallbackModel;
      }
    }

    // If all fallbacks fail, try to find any available model with required features
    const availableModels = Object.keys(models).filter(id => 
      id !== primaryModel && !fallbacks.includes(id)
    );
    
    for (const modelId of availableModels) {
      if (await this.isModelAvailable(modelId, options) && 
          this.modelSupportsFeatures(modelId, requiredFeatures)) {
        return modelId;
      }
    }

    // If everything fails, return an error indicator
    throw new Error("No available models found that match requirements");
  }

  /**
   * Find the lowest cost model that meets requirements
   */
  private async findLowestCostModel(
    request: ModelRequest,
    requiredFeatures: Set<keyof ModelInfo['supportedFeatures']>,
    options: RoutingOptions
  ): Promise<string> {
    // Sort models by cost (considering both input and output costs)
    const modelsByCost = Object.values(models)
      .filter(model => this.modelSupportsFeatures(model.id, requiredFeatures))
      .sort((a, b) => (a.inputPricing + a.outputPricing) - (b.inputPricing + b.outputPricing));
    
    // Try each model in order of cost until finding an available one
    for (const model of modelsByCost) {
      if (await this.isModelAvailable(model.id, options)) {
        return model.id;
      }
    }
    
    throw new Error("No available low-cost models found that match requirements");
  }

  /**
   * Find the fastest model that meets requirements
   */
  private async findFastestModel(
    request: ModelRequest,
    requiredFeatures: Set<keyof ModelInfo['supportedFeatures']>,
    options: RoutingOptions
  ): Promise<string> {
    // In a real implementation, this would use actual latency data
    // For now, we'll use a predefined list of models sorted by typical speed
    const fastestModels = [
      'anthropic/claude-3-haiku',
      'openai/gpt-3.5-turbo',
      'google/gemini-1.5-flash',
      'meta-llama/llama-3-70b-instruct',
      'anthropic/claude-3-sonnet',
      'openai/gpt-4o',
      'google/gemini-1.5-pro',
      'anthropic/claude-3-opus',
    ];
    
    // Try each model in order of speed until finding an available one that supports required features
    for (const modelId of fastestModels) {
      if (await this.isModelAvailable(modelId, options) && 
          this.modelSupportsFeatures(modelId, requiredFeatures)) {
        return modelId;
      }
    }
    
    throw new Error("No available fast models found that match requirements");
  }

  /**
   * Find the highest quality model that meets requirements
   */
  private async findHighestQualityModel(
    request: ModelRequest,
    requiredFeatures: Set<keyof ModelInfo['supportedFeatures']>,
    options: RoutingOptions
  ): Promise<string> {
    // In a real implementation, this would use actual quality metrics
    // For now, we'll use a predefined list of models sorted by perceived quality
    const highestQualityModels = [
      'anthropic/claude-3-opus',
      'openai/gpt-4o',
      'google/gemini-1.5-pro',
      'openai/gpt-4-turbo',
      'anthropic/claude-3-sonnet',
      'google/gemini-1.5-flash',
      'meta-llama/llama-3-70b-instruct',
      'anthropic/claude-3-haiku',
      'openai/gpt-3.5-turbo',
    ];
    
    // Try each model in order of quality until finding an available one that supports required features
    for (const modelId of highestQualityModels) {
      if (await this.isModelAvailable(modelId, options) && 
          this.modelSupportsFeatures(modelId, requiredFeatures)) {
        return modelId;
      }
    }
    
    throw new Error("No available high quality models found that match requirements");
  }

  /**
   * Extract required features from the request
   */
  private getRequiredFeatures(request: ModelRequest): Set<keyof ModelInfo['supportedFeatures']> {
    const features = new Set<keyof ModelInfo['supportedFeatures']>();
    
    // Check for image inputs (vision)
    const hasImageContent = request.messages.some(message => 
      Array.isArray(message.content) && 
      message.content.some(content => content.type === 'image_url')
    );
    if (hasImageContent) features.add('vision');
    
    // Check for function calling
    if (request.functions?.length || request.function_call) {
      features.add('functionCalling');
    }
    
    // Check for tool use
    if (request.tools?.length) {
      features.add('toolUse');
    }
    
    // Check for JSON mode
    if (request.response_format?.type === 'json_object') {
      features.add('json');
    }
    
    return features;
  }

  /**
   * Check if a model supports all required features
   */
  private modelSupportsFeatures(modelId: string, requiredFeatures: Set<keyof ModelInfo['supportedFeatures']>): boolean {
    const model = getModelById(modelId);
    if (!model) return false;
    
    // Check if model supports all required features
    for (const feature of requiredFeatures) {
      if (!model.supportedFeatures[feature]) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get recommended fallbacks that support all required features
   */
  private getRecommendedFallbacksForFeatures(
    modelId: string, 
    requiredFeatures: Set<keyof ModelInfo['supportedFeatures']>
  ): string[] {
    // Get standard recommended fallbacks
    const standardFallbacks = getRecommendedFallbacks(modelId);
    
    // Filter to only those that support required features
    return standardFallbacks.filter(fallbackId => 
      this.modelSupportsFeatures(fallbackId, requiredFeatures)
    );
  }
}

export default ModelRouter.getInstance();
