// Analytics and logging service for OpenRouter

export interface UsageRecord {
  id: string;
  timestamp: Date;
  userId: string;
  model: {
    requested: string;
    actual: string;
  };
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  latency: number;
  success: boolean;
  errorType?: string;
  routingStrategy?: string;
  endpointId?: string;
  cachingInfo?: {
    hit: boolean;
    ttl?: number;
  };
}

export interface UsageMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokens: {
    input: number;
    output: number;
    total: number;
  };
  totalCost: number;
  averageLatency: number;
  modelUsage: Record<string, number>;
  routingStats: {
    fallbacks: number;
    cachingHits: number;
  };
}

export interface UsageQuery {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  models?: string[];
  endpointId?: string;
  limit?: number;
  page?: number;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private usageRecords: UsageRecord[] = [];

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Log a usage record
   */
  public logUsage(record: Omit<UsageRecord, 'id' | 'timestamp'>): UsageRecord {
    const id = `usage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = new Date();
    
    const usageRecord: UsageRecord = {
      id,
      timestamp,
      ...record
    };
    
    this.usageRecords.push(usageRecord);
    
    // In a real implementation, we would persist this to a database
    return usageRecord;
  }

  /**
   * Query usage records with optional filters
   */
  public queryUsage(query: UsageQuery = {}): UsageRecord[] {
    let results = [...this.usageRecords];
    
    // Apply filters
    if (query.userId) {
      results = results.filter(record => record.userId === query.userId);
    }
    
    if (query.startDate) {
      results = results.filter(record => record.timestamp >= query.startDate);
    }
    
    if (query.endDate) {
      results = results.filter(record => record.timestamp <= query.endDate);
    }
    
    if (query.models && query.models.length > 0) {
      results = results.filter(record => 
        query.models!.includes(record.model.requested) || 
        query.models!.includes(record.model.actual)
      );
    }
    
    if (query.endpointId) {
      results = results.filter(record => record.endpointId === query.endpointId);
    }
    
    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Apply pagination if specified
    if (query.limit) {
      const page = query.page || 0;
      const offset = page * query.limit;
      results = results.slice(offset, offset + query.limit);
    }
    
    return results;
  }

  /**
   * Get aggregated usage metrics
   */
  public getMetrics(query: UsageQuery = {}): UsageMetrics {
    const records = this.queryUsage(query);
    
    const metrics: UsageMetrics = {
      totalRequests: records.length,
      successfulRequests: records.filter(r => r.success).length,
      failedRequests: records.filter(r => !r.success).length,
      totalTokens: {
        input: 0,
        output: 0,
        total: 0
      },
      totalCost: 0,
      averageLatency: 0,
      modelUsage: {},
      routingStats: {
        fallbacks: 0,
        cachingHits: 0
      }
    };
    
    // Calculate aggregated metrics
    let totalLatency = 0;
    
    for (const record of records) {
      // Token counts
      metrics.totalTokens.input += record.tokens.input;
      metrics.totalTokens.output += record.tokens.output;
      metrics.totalTokens.total += record.tokens.total;
      
      // Cost
      metrics.totalCost += record.cost;
      
      // Latency
      totalLatency += record.latency;
      
      // Model usage
      const requestedModel = record.model.requested;
      const actualModel = record.model.actual;
      
      metrics.modelUsage[requestedModel] = (metrics.modelUsage[requestedModel] || 0) + 1;
      
      // Track fallbacks
      if (requestedModel !== actualModel) {
        metrics.routingStats.fallbacks++;
      }
      
      // Cache hits
      if (record.cachingInfo?.hit) {
        metrics.routingStats.cachingHits++;
      }
    }
    
    // Calculate average latency
    metrics.averageLatency = records.length > 0 ? totalLatency / records.length : 0;
    
    return metrics;
  }

  /**
   * Clear all stored records (mainly for testing)
   */
  public clearRecords(): void {
    this.usageRecords = [];
  }
}

export default AnalyticsService.getInstance();
