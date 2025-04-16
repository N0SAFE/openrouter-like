// Batch processing service for OpenRouter
import { ModelRequest } from "./models";
import modelRouter from "./model-router";
import cacheManager from "./cache-manager";
import analyticsService from "./analytics";

export interface BatchRequest {
  id: string;
  userId: string;
  requests: ModelRequest[];
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'normal' | 'high';
  completedAt?: Date;
  results?: any[];
  error?: string;
  requestCount: number;
  completedCount: number;
  failedCount: number;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface BatchRequestOptions {
  priority?: 'low' | 'normal' | 'high';
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface BatchProcessingStats {
  totalBatches: number;
  pendingBatches: number;
  processingBatches: number;
  completedBatches: number;
  failedBatches: number;
  averageCompletionTime: number; // in milliseconds
  totalRequests: number;
  totalCompletedRequests: number;
  totalFailedRequests: number;
}

class BatchProcessor {
  private static instance: BatchProcessor;
  private batchRequests: Map<string, BatchRequest> = new Map();
  private processingQueue: string[] = [];
  private isProcessing: boolean = false;
  private maxConcurrentRequests: number = 5;

  private constructor() {
    // Start the processing loop
    this.startProcessingLoop();
  }

  public static getInstance(): BatchProcessor {
    if (!BatchProcessor.instance) {
      BatchProcessor.instance = new BatchProcessor();
    }
    return BatchProcessor.instance;
  }

  /**
   * Create a new batch request
   */
  public createBatch(
    userId: string,
    requests: ModelRequest[],
    options: BatchRequestOptions = {}
  ): BatchRequest {
    const id = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();
    
    const batch: BatchRequest = {
      id,
      userId,
      requests,
      createdAt: now,
      status: 'pending',
      priority: options.priority || 'normal',
      requestCount: requests.length,
      completedCount: 0,
      failedCount: 0,
      callbackUrl: options.callbackUrl,
      metadata: options.metadata,
    };
    
    this.batchRequests.set(id, batch);
    
    // Add to processing queue
    this.addToProcessingQueue(id);
    
    return batch;
  }

  /**
   * Get a batch request by ID
   */
  public getBatch(id: string, userId: string): BatchRequest | undefined {
    const batch = this.batchRequests.get(id);
    
    if (!batch || batch.userId !== userId) {
      return undefined;
    }
    
    return batch;
  }

  /**
   * Get all batch requests for a user
   */
  public getUserBatches(userId: string): BatchRequest[] {
    return Array.from(this.batchRequests.values())
      .filter(batch => batch.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get batch processing statistics
   */
  public getStats(userId?: string): BatchProcessingStats {
    const batches = userId
      ? Array.from(this.batchRequests.values()).filter(batch => batch.userId === userId)
      : Array.from(this.batchRequests.values());
    
    const pendingBatches = batches.filter(batch => batch.status === 'pending').length;
    const processingBatches = batches.filter(batch => batch.status === 'processing').length;
    const completedBatches = batches.filter(batch => batch.status === 'completed').length;
    const failedBatches = batches.filter(batch => batch.status === 'failed').length;
    
    // Calculate average completion time for completed batches
    let totalCompletionTime = 0;
    let completedBatchesWithTime = 0;
    
    for (const batch of batches) {
      if (batch.status === 'completed' && batch.completedAt) {
        totalCompletionTime += batch.completedAt.getTime() - batch.createdAt.getTime();
        completedBatchesWithTime++;
      }
    }
    
    const averageCompletionTime = completedBatchesWithTime > 0
      ? totalCompletionTime / completedBatchesWithTime
      : 0;
    
    // Calculate request totals
    const totalRequests = batches.reduce((total, batch) => total + batch.requestCount, 0);
    const totalCompletedRequests = batches.reduce((total, batch) => total + batch.completedCount, 0);
    const totalFailedRequests = batches.reduce((total, batch) => total + batch.failedCount, 0);
    
    return {
      totalBatches: batches.length,
      pendingBatches,
      processingBatches,
      completedBatches,
      failedBatches,
      averageCompletionTime,
      totalRequests,
      totalCompletedRequests,
      totalFailedRequests
    };
  }

  /**
   * Cancel a batch request
   */
  public cancelBatch(id: string, userId: string): boolean {
    const batch = this.batchRequests.get(id);
    
    if (!batch || batch.userId !== userId) {
      return false;
    }
    
    // Can only cancel pending batches
    if (batch.status !== 'pending') {
      return false;
    }
    
    // Remove from processing queue
    const index = this.processingQueue.indexOf(id);
    if (index !== -1) {
      this.processingQueue.splice(index, 1);
    }
    
    // Update status
    this.batchRequests.set(id, {
      ...batch,
      status: 'failed',
      error: 'Batch cancelled by user',
      completedAt: new Date()
    });
    
    return true;
  }

  /**
   * Add a batch to the processing queue
   */
  private addToProcessingQueue(batchId: string): void {
    const batch = this.batchRequests.get(batchId);
    if (!batch) return;
    
    // Insert based on priority
    const priorityValue = { high: 0, normal: 1, low: 2 }[batch.priority];
    
    let inserted = false;
    for (let i = 0; i < this.processingQueue.length; i++) {
      const queuedBatch = this.batchRequests.get(this.processingQueue[i]);
      if (queuedBatch) {
        const queuedPriority = { high: 0, normal: 1, low: 2 }[queuedBatch.priority];
        
        if (priorityValue < queuedPriority) {
          this.processingQueue.splice(i, 0, batchId);
          inserted = true;
          break;
        }
      }
    }
    
    if (!inserted) {
      this.processingQueue.push(batchId);
    }
    
    // Trigger processing if not already running
    if (!this.isProcessing) {
      this.processNextBatch();
    }
  }

  /**
   * Start the processing loop
   */
  private startProcessingLoop(): void {
    // In a real implementation, this would be handled by a job queue system
    // For this demo, we'll use a simple interval to check for pending batches
    setInterval(() => {
      if (!this.isProcessing && this.processingQueue.length > 0) {
        this.processNextBatch();
      }
    }, 1000);
  }

  /**
   * Process the next batch in the queue
   */
  private async processNextBatch(): Promise<void> {
    if (this.processingQueue.length === 0) {
      this.isProcessing = false;
      return;
    }
    
    this.isProcessing = true;
    const batchId = this.processingQueue.shift();
    
    if (!batchId) {
      this.isProcessing = false;
      return;
    }
    
    const batch = this.batchRequests.get(batchId);
    if (!batch) {
      this.isProcessing = false;
      this.processNextBatch();
      return;
    }
    
    // Update status to processing
    this.batchRequests.set(batchId, {
      ...batch,
      status: 'processing'
    });
    
    try {
      // Process requests in parallel, but limited to maxConcurrentRequests
      const results = [];
      
      // Process in chunks to limit concurrency
      for (let i = 0; i < batch.requests.length; i += this.maxConcurrentRequests) {
        const chunk = batch.requests.slice(i, i + this.maxConcurrentRequests);
        
        // Process this chunk in parallel
        const chunkResults = await Promise.allSettled(
          chunk.map(request => this.processRequest(request, batch.userId))
        );
        
        // Update batch status
        const currentBatch = this.batchRequests.get(batchId)!;
        let completedCount = currentBatch.completedCount;
        let failedCount = currentBatch.failedCount;
        
        // Process results
        for (const result of chunkResults) {
          if (result.status === 'fulfilled') {
            results.push(result.value);
            completedCount++;
          } else {
            results.push({ error: result.reason.message || 'Request failed' });
            failedCount++;
          }
        }
        
        // Update batch with intermediate progress
        this.batchRequests.set(batchId, {
          ...currentBatch,
          completedCount,
          failedCount
        });
      }
      
      // All requests processed, update batch as completed
      this.batchRequests.set(batchId, {
        ...batch,
        status: 'completed',
        completedAt: new Date(),
        results,
        completedCount: results.filter(r => !r.error).length,
        failedCount: results.filter(r => r.error).length
      });
      
      // Call the webhook if specified
      if (batch.callbackUrl) {
        this.sendCallback(batch.id);
      }
      
    } catch (error: any) {
      // Update batch as failed
      this.batchRequests.set(batchId, {
        ...batch,
        status: 'failed',
        error: error.message || 'Batch processing failed',
        completedAt: new Date()
      });
    }
    
    // Continue processing the queue
    this.isProcessing = false;
    this.processNextBatch();
  }

  /**
   * Process a single request
   */
  private async processRequest(request: ModelRequest, userId: string): Promise<any> {
    try {
      // Check for cached response
      const cachedResponse = cacheManager.getCachedResponse(request);
      if (cachedResponse) {
        return cachedResponse.response;
      }
      
      // Route the request to the appropriate model
      const actualModelId = await modelRouter.routeRequest(request);
      
      // In a real implementation, this would make an actual API call
      // For this demo, we'll simulate a response
      
      // Mock implementation - would be replaced with actual API calls
      const startTime = Date.now();
      
      // Simulate response time based on model complexity
      await new Promise(resolve => 
        setTimeout(resolve, 
          actualModelId.includes('opus') ? 1500 : 
          actualModelId.includes('gpt-4') ? 1200 :
          actualModelId.includes('claude-3-sonnet') ? 1000 : 500
        )
      );
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      // Simulate token usage
      const inputTokens = Math.floor(Math.random() * 200) + 50;
      const outputTokens = Math.floor(Math.random() * 500) + 100;
      
      // Simulate response
      const response = {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: actualModelId,
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: `This is a simulated batch response from ${actualModelId}.`
            },
            finish_reason: "stop"
          }
        ],
        usage: {
          prompt_tokens: inputTokens,
          completion_tokens: outputTokens,
          total_tokens: inputTokens + outputTokens
        },
        routed_through: actualModelId
      };
      
      // Cache the response if appropriate
      if (response && !request.stream) {
        cacheManager.setCachedResponse(
          request, 
          response, 
          { 
            input: inputTokens, 
            output: outputTokens, 
            total: inputTokens + outputTokens 
          }
        );
      }
      
      // Log analytics
      analyticsService.logUsage({
        userId,
        model: {
          requested: request.model,
          actual: actualModelId
        },
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens
        },
        cost: this.estimateCost(actualModelId, inputTokens, outputTokens),
        latency,
        success: true,
        routingStrategy: request.route,
        cachingInfo: {
          hit: false
        }
      });
      
      return response;
      
    } catch (error: any) {
      // Log error in analytics
      analyticsService.logUsage({
        userId,
        model: {
          requested: request.model,
          actual: request.model
        },
        tokens: {
          input: 0,
          output: 0,
          total: 0
        },
        cost: 0,
        latency: 0,
        success: false,
        errorType: error.name || 'Error'
      });
      
      throw error;
    }
  }

  /**
   * Send a webhook callback for a completed batch
   */
  private async sendCallback(batchId: string): Promise<void> {
    const batch = this.batchRequests.get(batchId);
    if (!batch || !batch.callbackUrl) return;
    
    // In a real implementation, this would make an actual HTTP request
    console.log(`Sending callback for batch ${batchId} to ${batch.callbackUrl}`);
  }

  /**
   * Estimate cost based on model and token usage
   */
  private estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
    // Base rates per million tokens
    const rates: Record<string, { input: number, output: number }> = {
      'openai/gpt-4o': { input: 5, output: 15 },
      'openai/gpt-4-turbo': { input: 10, output: 30 },
      'openai/gpt-3.5-turbo': { input: 0.5, output: 1.5 },
      'anthropic/claude-3-opus': { input: 15, output: 75 },
      'anthropic/claude-3-sonnet': { input: 3, output: 15 },
      'anthropic/claude-3-haiku': { input: 0.25, output: 1.25 },
      'google/gemini-1.5-pro': { input: 7, output: 21 },
      'google/gemini-1.5-flash': { input: 1.5, output: 5 },
      'meta-llama/llama-3-70b-instruct': { input: 0.9, output: 2.7 }
    };
    
    // Default rates if model not found
    const defaultRates = { input: 1, output: 2 };
    
    // Get rates for this model
    const modelRates = rates[modelId] || defaultRates;
    
    // Calculate cost in dollars
    const inputCost = (inputTokens / 1_000_000) * modelRates.input;
    const outputCost = (outputTokens / 1_000_000) * modelRates.output;
    
    return inputCost + outputCost;
  }
}

export default BatchProcessor.getInstance();
