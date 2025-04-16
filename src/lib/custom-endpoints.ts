// This file implements the Custom Endpoints feature mentioned in the documentation
import { z } from 'zod';
import { ModelRequest, ModelRequestSchema } from './models';
import { RoutingStrategy } from './model-router';

// Interface defining a custom endpoint configuration
export interface CustomEndpointConfig {
  id: string;
  name: string;
  description: string;
  baseModel: string;
  fallbacks: string[];
  routingStrategy: RoutingStrategy;
  parameters: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
  systemPrompt?: string;
  createdAt: Date;
  updatedAt: Date;
  owner: string;
  isPublic: boolean;
  apiKey?: string; // Specific API key for this endpoint (if different from account default)
  rateLimit?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

// Zod schema for validating custom endpoint creation/updates
export const CustomEndpointSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  baseModel: z.string(),
  fallbacks: z.array(z.string()).optional().default([]),
  routingStrategy: z.enum(['default', 'fallback', 'lowest-cost', 'fastest', 'highest-quality']).default('fallback'),
  parameters: z.object({
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().positive().int().optional(),
    topP: z.number().min(0).max(1).optional(),
    frequencyPenalty: z.number().min(-2).max(2).optional(),
    presencePenalty: z.number().min(-2).max(2).optional(),
  }).optional().default({}),
  systemPrompt: z.string().max(4000).optional(),
  isPublic: z.boolean().default(false),
  apiKey: z.string().optional(),
  rateLimit: z.object({
    requestsPerMinute: z.number().int().positive().optional(),
    tokensPerMinute: z.number().int().positive().optional(),
  }).optional(),
});

export type CustomEndpointInput = z.infer<typeof CustomEndpointSchema>;

export class CustomEndpointsManager {
  private static instance: CustomEndpointsManager;
  private endpoints: Map<string, CustomEndpointConfig> = new Map();

  private constructor() {}

  public static getInstance(): CustomEndpointsManager {
    if (!CustomEndpointsManager.instance) {
      CustomEndpointsManager.instance = new CustomEndpointsManager();
    }
    return CustomEndpointsManager.instance;
  }

  /**
   * Create a new custom endpoint
   */
  public createEndpoint(input: CustomEndpointInput, owner: string): CustomEndpointConfig {
    const id = `endpoint_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();
    
    const endpoint: CustomEndpointConfig = {
      id,
      ...input,
      createdAt: now,
      updatedAt: now,
      owner,
    };
    
    this.endpoints.set(id, endpoint);
    return endpoint;
  }

  /**
   * Get a custom endpoint by ID
   */
  public getEndpoint(id: string): CustomEndpointConfig | undefined {
    return this.endpoints.get(id);
  }

  /**
   * Update an existing custom endpoint
   */
  public updateEndpoint(id: string, input: Partial<CustomEndpointInput>, owner: string): CustomEndpointConfig | null {
    const endpoint = this.endpoints.get(id);
    
    if (!endpoint || endpoint.owner !== owner) {
      return null;
    }
    
    const updatedEndpoint: CustomEndpointConfig = {
      ...endpoint,
      ...input,
      updatedAt: new Date(),
    };
    
    this.endpoints.set(id, updatedEndpoint);
    return updatedEndpoint;
  }

  /**
   * Delete a custom endpoint
   */
  public deleteEndpoint(id: string, owner: string): boolean {
    const endpoint = this.endpoints.get(id);
    
    if (!endpoint || endpoint.owner !== owner) {
      return false;
    }
    
    return this.endpoints.delete(id);
  }

  /**
   * List all custom endpoints for a user
   */
  public listEndpoints(owner: string): CustomEndpointConfig[] {
    return Array.from(this.endpoints.values())
      .filter(endpoint => endpoint.owner === owner || endpoint.isPublic);
  }

  /**
   * Convert a standard model request into one that uses the custom endpoint's settings
   */
  public applyEndpointToRequest(endpointId: string, request: ModelRequest): ModelRequest | null {
    const endpoint = this.endpoints.get(endpointId);
    
    if (!endpoint) {
      return null;
    }
    
    // Start with base model and routing strategy
    const modifiedRequest: ModelRequest = {
      ...request,
      model: endpoint.baseModel,
      route: endpoint.routingStrategy,
    };
    
    // Apply fallbacks if not already specified
    if (!modifiedRequest.fallbacks && endpoint.fallbacks.length > 0) {
      modifiedRequest.fallbacks = endpoint.fallbacks;
    }
    
    // Apply system prompt if provided and not overridden
    if (endpoint.systemPrompt && (!modifiedRequest.messages || !modifiedRequest.messages.some(m => m.role === 'system'))) {
      modifiedRequest.messages = [
        { role: 'system', content: endpoint.systemPrompt },
        ...(modifiedRequest.messages || []),
      ];
    }
    
    // Apply default parameters if not specified in request
    if (endpoint.parameters) {
      if (endpoint.parameters.temperature !== undefined && modifiedRequest.temperature === undefined) {
        modifiedRequest.temperature = endpoint.parameters.temperature;
      }
      
      if (endpoint.parameters.maxTokens !== undefined && modifiedRequest.max_tokens === undefined) {
        modifiedRequest.max_tokens = endpoint.parameters.maxTokens;
      }
      
      if (endpoint.parameters.topP !== undefined && modifiedRequest.top_p === undefined) {
        modifiedRequest.top_p = endpoint.parameters.topP;
      }
      
      if (endpoint.parameters.frequencyPenalty !== undefined && modifiedRequest.frequency_penalty === undefined) {
        modifiedRequest.frequency_penalty = endpoint.parameters.frequencyPenalty;
      }
      
      if (endpoint.parameters.presencePenalty !== undefined && modifiedRequest.presence_penalty === undefined) {
        modifiedRequest.presence_penalty = endpoint.parameters.presencePenalty;
      }
    }
    
    return modifiedRequest;
  }
}

export default CustomEndpointsManager.getInstance();
