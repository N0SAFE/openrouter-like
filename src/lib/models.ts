import { z } from 'zod';

export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'meta-llama' | 'mistral';

export interface ModelInfo {
  id: string;
  provider: ModelProvider;
  name: string;
  contextWindow: number;
  inputPricing: number;  // per 1M tokens
  outputPricing: number; // per 1M tokens
  strengths: string[];
  supportedFeatures: {
    vision: boolean;
    functionCalling: boolean;
    toolUse: boolean;
    json: boolean;
  };
  maxOutputTokens?: number;
}

export const models: Record<string, ModelInfo> = {
  'openai/gpt-4o': {
    id: 'openai/gpt-4o',
    provider: 'openai',
    name: 'GPT-4o',
    contextWindow: 128000,
    inputPricing: 5,
    outputPricing: 15,
    strengths: ['multimodal', 'reasoning', 'creative', 'code'],
    supportedFeatures: {
      vision: true,
      functionCalling: true,
      toolUse: true,
      json: true,
    },
    maxOutputTokens: 4096,
  },
  'openai/gpt-4-turbo': {
    id: 'openai/gpt-4-turbo',
    provider: 'openai',
    name: 'GPT-4 Turbo',
    contextWindow: 128000,
    inputPricing: 10,
    outputPricing: 30,
    strengths: ['reasoning', 'creative', 'code'],
    supportedFeatures: {
      vision: false,
      functionCalling: true,
      toolUse: false,
      json: true,
    },
    maxOutputTokens: 4096,
  },
  'openai/gpt-3.5-turbo': {
    id: 'openai/gpt-3.5-turbo',
    provider: 'openai',
    name: 'GPT-3.5 Turbo',
    contextWindow: 16384,
    inputPricing: 0.5,
    outputPricing: 1.5,
    strengths: ['speed', 'cost-effective'],
    supportedFeatures: {
      vision: false,
      functionCalling: true,
      toolUse: false,
      json: true,
    },
    maxOutputTokens: 4096,
  },
  'anthropic/claude-3-opus': {
    id: 'anthropic/claude-3-opus',
    provider: 'anthropic',
    name: 'Claude 3 Opus',
    contextWindow: 200000,
    inputPricing: 15,
    outputPricing: 75,
    strengths: ['reasoning', 'accuracy', 'long-form'],
    supportedFeatures: {
      vision: true,
      functionCalling: true,
      toolUse: true,
      json: true,
    },
    maxOutputTokens: 4096,
  },
  'anthropic/claude-3-sonnet': {
    id: 'anthropic/claude-3-sonnet',
    provider: 'anthropic',
    name: 'Claude 3 Sonnet',
    contextWindow: 200000,
    inputPricing: 3,
    outputPricing: 15,
    strengths: ['balanced', 'versatile'],
    supportedFeatures: {
      vision: true,
      functionCalling: true,
      toolUse: true,
      json: true,
    },
    maxOutputTokens: 4096,
  },
  'anthropic/claude-3-haiku': {
    id: 'anthropic/claude-3-haiku',
    provider: 'anthropic',
    name: 'Claude 3 Haiku',
    contextWindow: 200000,
    inputPricing: 0.25,
    outputPricing: 1.25,
    strengths: ['speed', 'cost-effective'],
    supportedFeatures: {
      vision: true,
      functionCalling: true,
      toolUse: false,
      json: true,
    },
    maxOutputTokens: 4096,
  },
  'google/gemini-1.5-pro': {
    id: 'google/gemini-1.5-pro',
    provider: 'google',
    name: 'Gemini 1.5 Pro',
    contextWindow: 1000000,
    inputPricing: 7,
    outputPricing: 21,
    strengths: ['long-context', 'multimodal'],
    supportedFeatures: {
      vision: true,
      functionCalling: true,
      toolUse: true,
      json: true,
    },
    maxOutputTokens: 8192,
  },
  'google/gemini-1.5-flash': {
    id: 'google/gemini-1.5-flash',
    provider: 'google',
    name: 'Gemini 1.5 Flash',
    contextWindow: 1000000,
    inputPricing: 1.5,
    outputPricing: 5,
    strengths: ['speed', 'cost-effective', 'long-context'],
    supportedFeatures: {
      vision: true,
      functionCalling: true,
      toolUse: false,
      json: true,
    },
    maxOutputTokens: 8192,
  },
  'meta-llama/llama-3-70b-instruct': {
    id: 'meta-llama/llama-3-70b-instruct',
    provider: 'meta-llama',
    name: 'Llama 3 70B Instruct',
    contextWindow: 8192,
    inputPricing: 0.9,
    outputPricing: 2.7,
    strengths: ['open-source', 'cost-effective'],
    supportedFeatures: {
      vision: false,
      functionCalling: false,
      toolUse: false,
      json: false,
    },
    maxOutputTokens: 4096,
  },
};

export const getModelById = (id: string): ModelInfo | undefined => {
  return models[id];
};

export const getModelsByProvider = (provider: ModelProvider): ModelInfo[] => {
  return Object.values(models).filter(model => model.provider === provider);
};

// Filter models based on specific capabilities or features
export const getModelsByFeature = (feature: keyof ModelInfo['supportedFeatures']): ModelInfo[] => {
  return Object.values(models).filter(model => model.supportedFeatures[feature]);
};

// Get models optimized for specific use cases
export const getModelsByStrength = (strength: string): ModelInfo[] => {
  return Object.values(models).filter(model => model.strengths.includes(strength));
};

// Get models sorted by specific criteria
export const getModelsSortedBy = (
  criteria: 'inputPricing' | 'outputPricing' | 'contextWindow',
  ascending: boolean = true
): ModelInfo[] => {
  return [...Object.values(models)].sort((a, b) => {
    return ascending ? a[criteria] - b[criteria] : b[criteria] - a[criteria];
  });
};

// Get recommended fallbacks for a specific model
export const getRecommendedFallbacks = (modelId: string): string[] => {
  const fallbackMap: Record<string, string[]> = {
    'openai/gpt-4o': ['anthropic/claude-3-opus', 'openai/gpt-4-turbo', 'google/gemini-1.5-pro'],
    'anthropic/claude-3-opus': ['openai/gpt-4o', 'anthropic/claude-3-sonnet', 'google/gemini-1.5-pro'],
    'google/gemini-1.5-pro': ['openai/gpt-4o', 'anthropic/claude-3-opus', 'anthropic/claude-3-sonnet'],
    'anthropic/claude-3-sonnet': ['anthropic/claude-3-haiku', 'openai/gpt-3.5-turbo', 'meta-llama/llama-3-70b-instruct'],
    'openai/gpt-3.5-turbo': ['anthropic/claude-3-haiku', 'meta-llama/llama-3-70b-instruct', 'google/gemini-1.5-flash'],
    'anthropic/claude-3-haiku': ['openai/gpt-3.5-turbo', 'meta-llama/llama-3-70b-instruct', 'google/gemini-1.5-flash'],
  };
  
  return fallbackMap[modelId] || [];
};

// Validate model ID
export const validateModelId = (modelId: string): boolean => {
  return modelId in models;
};

// Zod schema for model request parameters
export const ModelRequestSchema = z.object({
  model: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().or(
        z.array(
          z.object({
            type: z.enum(['text', 'image_url']),
            text: z.string().optional(),
            image_url: z.object({
              url: z.string(),
              detail: z.enum(['low', 'high', 'auto']).optional(),
            }).optional(),
          })
        )
      ),
      name: z.string().optional(),
    })
  ),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().positive().int().optional(),
  top_p: z.number().min(0).max(1).optional(),
  stream: z.boolean().optional(),
  stop: z.string().or(z.array(z.string())).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  functions: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      parameters: z.record(z.any()).optional(),
    })
  ).optional(),
  function_call: z.union([
    z.string(),
    z.object({
      name: z.string(),
    })
  ]).optional(),
  tools: z.array(
    z.object({
      type: z.string(),
      function: z.object({
        name: z.string(),
        description: z.string().optional(),
        parameters: z.record(z.any()),
      }),
    })
  ).optional(),
  route: z.enum(['default', 'fallback', 'lowest-cost', 'fastest', 'highest-quality']).optional(),
  fallbacks: z.array(z.string()).optional(),
  response_format: z.object({
    type: z.enum(['text', 'json_object']).optional(),
  }).optional(),
});

export type ModelRequest = z.infer<typeof ModelRequestSchema>;
