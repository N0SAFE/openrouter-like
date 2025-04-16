import { NextRequest, NextResponse } from "next/server";
import { ModelRequestSchema } from "@/lib/models";
import modelRouter from "@/lib/model-router";
import cacheManager from "@/lib/cache-manager";
import customEndpoints from "@/lib/custom-endpoints";
import aiClient from "@/lib/ai-client";
import analyticsService from "@/lib/analytics";
import { StreamingTextResponse, Message } from 'ai';
import { z } from "zod";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    
    // Extract endpoint ID if it's a custom endpoint request
    const url = new URL(req.url);
    const endpointId = url.searchParams.get('endpoint');
    const userId = req.headers.get('x-user-id') || 'anonymous';
    
    let modelRequest;
    
    if (endpointId) {
      // Process as a custom endpoint request
      modelRequest = customEndpoints.applyEndpointToRequest(endpointId, body);
      
      if (!modelRequest) {
        return NextResponse.json(
          { error: "Invalid endpoint ID" },
          { status: 400 }
        );
      }
    } else {
      // Regular chat completion request
      try {
        modelRequest = ModelRequestSchema.parse(body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: "Invalid request format", details: error.format() },
            { status: 400 }
          );
        }
        throw error;
      }
    }
    
    // Check for cached response if caching is enabled and not streaming
    if (!modelRequest.stream) {
      const cachedResponse = cacheManager.getCachedResponse(modelRequest);
      if (cachedResponse) {
        // Log analytics for cache hit
        analyticsService.logUsage({
          userId,
          model: {
            requested: modelRequest.model,
            actual: cachedResponse.modelId
          },
          tokens: cachedResponse.tokenUsage,
          cost: 0, // No cost for cached responses
          latency: 0,
          success: true,
          cachingInfo: {
            hit: true
          }
        });
        
        return NextResponse.json(cachedResponse.response);
      }
    }

    const startTime = Date.now();
    
    // Format messages for the AI client
    const messages = modelRequest.messages.map((msg: any) => ({
      role: msg.role,
      content: typeof msg.content === 'string' 
        ? msg.content 
        : Array.isArray(msg.content) 
          ? msg.content.map((c: any) => {
              if (c.type === 'text') return c.text;
              // For now, we don't handle multimodal content
              return '';
            }).join(' ')
          : '',
    })) as Message[];
    
    // Handle streaming responses
    if (modelRequest.stream) {
      const stream = await aiClient.stream(
        messages, 
        modelRequest.model, 
        {
          temperature: modelRequest.temperature,
          maxTokens: modelRequest.max_tokens,
        }
      );
      
      // Log analytics for streaming request
      analyticsService.logUsage({
        userId,
        model: {
          requested: modelRequest.model,
          actual: stream.model // This assumes stream contains the actual model used
        },
        tokens: {
          input: 0, // These will be estimated
          output: 0,
          total: 0
        },
        cost: 0, // This will be updated later
        latency: Date.now() - startTime,
        success: true
      });
      
      // Return streaming response
      return new StreamingTextResponse(stream.completion);
    }
    
    // Handle normal (non-streaming) completions
    const options = {
      temperature: modelRequest.temperature,
      maxTokens: modelRequest.max_tokens,
      tools: modelRequest.tools,
      functions: modelRequest.functions
    };
    
    // Process with AI client
    const response = await aiClient.complete(messages, modelRequest.model, options);
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    // Format the response to match OpenAI's format for consistency
    const formattedResponse = formatResponseForApi(response);
    
    // Cache the response if appropriate
    if (formattedResponse && formattedResponse.usage) {
      cacheManager.setCachedResponse(
        modelRequest, 
        formattedResponse, 
        {
          input: formattedResponse.usage.prompt_tokens,
          output: formattedResponse.usage.completion_tokens,
          total: formattedResponse.usage.total_tokens
        }
      );
    }
    
    // Log analytics
    analyticsService.logUsage({
      userId,
      model: {
        requested: modelRequest.model,
        actual: response.model
      },
      tokens: {
        input: formattedResponse.usage?.prompt_tokens || 0,
        output: formattedResponse.usage?.completion_tokens || 0,
        total: formattedResponse.usage?.total_tokens || 0
      },
      cost: calculateCost(response.model, formattedResponse.usage),
      latency,
      success: true,
      cachingInfo: {
        hit: false
      }
    });
    
    // Return the response in the expected format
    return NextResponse.json(formattedResponse);
    
  } catch (error: any) {
    console.error("Error in chat completion:", error);
    
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 }
    );
  }
}

// Format the AI SDK response to match OpenAI's API format for consistency
function formatResponseForApi(aiResponse: any) {
  // Handle different provider response formats
  if (aiResponse.provider === 'openai') {
    // OpenAI responses are already close to our format
    const completion = aiResponse.completion;
    
    return {
      id: completion.id || `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: aiResponse.model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: completion.content
          },
          finish_reason: completion.finish_reason || "stop"
        }
      ],
      usage: completion.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      },
      routed_through: `${aiResponse.provider}/${aiResponse.model}`
    };
  } 
  else if (aiResponse.provider === 'anthropic') {
    // Map Anthropic's response format to OpenAI-like format
    const completion = aiResponse.completion;
    
    return {
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: aiResponse.model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: completion.content?.[0]?.text || ''
          },
          finish_reason: completion.stop_reason || "stop"
        }
      ],
      usage: completion.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      },
      routed_through: `${aiResponse.provider}/${aiResponse.model}`
    };
  }
  else {
    // Generic fallback
    return {
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: aiResponse.model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: typeof aiResponse.completion === 'string' 
              ? aiResponse.completion 
              : JSON.stringify(aiResponse.completion)
          },
          finish_reason: "stop"
        }
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      },
      routed_through: `${aiResponse.provider}/${aiResponse.model}`
    };
  }
}

// Calculate cost based on token usage and model
function calculateCost(modelId: string, usage?: { prompt_tokens: number, completion_tokens: number }) {
  if (!usage) return 0;
  
  // Base rates per million tokens
  const rates: Record<string, { input: number, output: number }> = {
    'gpt-4o': { input: 5, output: 15 },
    'gpt-4-turbo': { input: 10, output: 30 },
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
    'claude-3-opus': { input: 15, output: 75 },
    'claude-3-sonnet': { input: 3, output: 15 },
    'claude-3-haiku': { input: 0.25, output: 1.25 }
  };
  
  // Find the matching rate or use default
  let rate = { input: 1, output: 2 }; // Default fallback rate
  for (const [model, modelRate] of Object.entries(rates)) {
    if (modelId.includes(model)) {
      rate = modelRate;
      break;
    }
  }
  
  // Calculate cost in dollars
  const inputCost = (usage.prompt_tokens / 1_000_000) * rate.input;
  const outputCost = (usage.completion_tokens / 1_000_000) * rate.output;
  
  return inputCost + outputCost;
}
