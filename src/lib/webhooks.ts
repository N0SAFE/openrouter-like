// Webhooks service for OpenRouter

export interface WebhookConfig {
  id: string;
  url: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  events: WebhookEventType[];
  secret?: string;
  active: boolean;
  headers?: Record<string, string>;
  retries: number;
  lastStatus?: {
    success: boolean;
    timestamp: Date;
    statusCode?: number;
    message?: string;
  };
}

export type WebhookEventType = 
  | 'request.created'
  | 'request.completed'
  | 'request.failed'
  | 'model.unavailable'
  | 'model.fallback'
  | 'endpoint.created'
  | 'endpoint.updated'
  | 'endpoint.deleted'
  | 'credit.low'
  | 'error';

export interface WebhookEvent<T = any> {
  id: string;
  timestamp: Date;
  userId: string;
  type: WebhookEventType;
  data: T;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventId: string;
  timestamp: Date;
  success: boolean;
  statusCode?: number;
  responseBody?: string;
  attempt: number;
  nextRetry?: Date;
}

export interface WebhookQuery {
  userId?: string;
  eventType?: WebhookEventType;
  active?: boolean;
}

class WebhooksService {
  private static instance: WebhooksService;
  private webhooks: Map<string, WebhookConfig> = new Map();
  private events: WebhookEvent[] = [];
  private deliveries: WebhookDelivery[] = [];

  private constructor() {}

  public static getInstance(): WebhooksService {
    if (!WebhooksService.instance) {
      WebhooksService.instance = new WebhooksService();
    }
    return WebhooksService.instance;
  }

  /**
   * Create a new webhook configuration
   */
  public createWebhook(
    userId: string,
    url: string,
    name: string,
    events: WebhookEventType[],
    options: {
      description?: string;
      secret?: string;
      headers?: Record<string, string>;
      retries?: number;
    } = {}
  ): WebhookConfig {
    const id = `webhook_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();
    
    const webhook: WebhookConfig = {
      id,
      url,
      userId,
      name,
      description: options.description,
      createdAt: now,
      updatedAt: now,
      events,
      secret: options.secret,
      active: true,
      headers: options.headers,
      retries: options.retries || 3
    };
    
    this.webhooks.set(id, webhook);
    return webhook;
  }

  /**
   * Get a webhook by ID
   */
  public getWebhook(id: string): WebhookConfig | undefined {
    return this.webhooks.get(id);
  }

  /**
   * Update an existing webhook
   */
  public updateWebhook(
    id: string,
    userId: string,
    updates: Partial<Omit<WebhookConfig, 'id' | 'userId' | 'createdAt'>>
  ): WebhookConfig | null {
    const webhook = this.webhooks.get(id);
    
    if (!webhook || webhook.userId !== userId) {
      return null;
    }
    
    const updatedWebhook: WebhookConfig = {
      ...webhook,
      ...updates,
      updatedAt: new Date()
    };
    
    this.webhooks.set(id, updatedWebhook);
    return updatedWebhook;
  }

  /**
   * Delete a webhook
   */
  public deleteWebhook(id: string, userId: string): boolean {
    const webhook = this.webhooks.get(id);
    
    if (!webhook || webhook.userId !== userId) {
      return false;
    }
    
    return this.webhooks.delete(id);
  }

  /**
   * List webhooks with optional filtering
   */
  public listWebhooks(query: WebhookQuery = {}): WebhookConfig[] {
    let results = Array.from(this.webhooks.values());
    
    if (query.userId) {
      results = results.filter(webhook => webhook.userId === query.userId);
    }
    
    if (query.eventType) {
      results = results.filter(webhook => webhook.events.includes(query.eventType!));
    }
    
    if (query.active !== undefined) {
      results = results.filter(webhook => webhook.active === query.active);
    }
    
    return results;
  }

  /**
   * Create and trigger a webhook event
   */
  public async triggerEvent<T>(
    userId: string,
    type: WebhookEventType,
    data: T
  ): Promise<string> {
    // Create the event
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const event: WebhookEvent<T> = {
      id: eventId,
      timestamp: new Date(),
      userId,
      type,
      data
    };
    
    this.events.push(event);
    
    // Find all active webhooks that should receive this event
    const eligibleWebhooks = Array.from(this.webhooks.values())
      .filter(webhook => 
        webhook.active && 
        webhook.userId === userId &&
        webhook.events.includes(type)
      );
    
    // Deliver the event to each webhook
    for (const webhook of eligibleWebhooks) {
      this.deliverEvent(webhook, event);
    }
    
    return eventId;
  }

  /**
   * Get webhook event history
   */
  public getEvents(
    userId: string, 
    options: { 
      limit?: number; 
      eventType?: WebhookEventType 
    } = {}
  ): WebhookEvent[] {
    let results = this.events.filter(event => event.userId === userId);
    
    if (options.eventType) {
      results = results.filter(event => event.type === options.eventType);
    }
    
    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Apply limit if specified
    if (options.limit) {
      results = results.slice(0, options.limit);
    }
    
    return results;
  }

  /**
   * Get webhook delivery history
   */
  public getDeliveries(
    userId: string,
    webhookId?: string,
    options: { 
      limit?: number;
      onlyFailed?: boolean;
    } = {}
  ): WebhookDelivery[] {
    // First get the user's webhooks
    const userWebhookIds = Array.from(this.webhooks.values())
      .filter(webhook => webhook.userId === userId)
      .map(webhook => webhook.id);
    
    let results = this.deliveries.filter(
      delivery => userWebhookIds.includes(delivery.webhookId)
    );
    
    // Filter by specific webhook if provided
    if (webhookId) {
      results = results.filter(delivery => delivery.webhookId === webhookId);
    }
    
    // Filter by status if requested
    if (options.onlyFailed) {
      results = results.filter(delivery => !delivery.success);
    }
    
    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Apply limit if specified
    if (options.limit) {
      results = results.slice(0, options.limit);
    }
    
    return results;
  }

  /**
   * Manually retry a specific webhook delivery
   */
  public async retryDelivery(deliveryId: string, userId: string): Promise<boolean> {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    
    if (!delivery) {
      return false;
    }
    
    // Check that user owns this webhook
    const webhook = this.webhooks.get(delivery.webhookId);
    if (!webhook || webhook.userId !== userId) {
      return false;
    }
    
    // Find the original event
    const event = this.events.find(e => e.id === delivery.eventId);
    if (!event) {
      return false;
    }
    
    // Retry the delivery
    await this.deliverEvent(webhook, event, delivery.attempt + 1);
    
    return true;
  }

  /**
   * Internal method to deliver an event to a webhook endpoint
   */
  private async deliverEvent(
    webhook: WebhookConfig,
    event: WebhookEvent,
    attemptNumber = 1
  ): Promise<WebhookDelivery> {
    const deliveryId = `delivery_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // In a real implementation, this would make an HTTP request to the webhook URL
    // For now, we'll simulate a delivery
    
    // Create a simulated response - in a real implementation, this would be the actual response
    const success = Math.random() > 0.2; // 80% chance of success
    
    const delivery: WebhookDelivery = {
      id: deliveryId,
      webhookId: webhook.id,
      eventId: event.id,
      timestamp: new Date(),
      success,
      statusCode: success ? 200 : 500,
      responseBody: success ? "Webhook received" : "Internal server error",
      attempt: attemptNumber
    };
    
    // Schedule a retry if needed
    if (!success && attemptNumber < webhook.retries) {
      // Exponential backoff: 2^attemptNumber seconds (e.g., 2, 4, 8, 16, ...)
      const retryDelayMs = Math.pow(2, attemptNumber) * 1000;
      delivery.nextRetry = new Date(Date.now() + retryDelayMs);
      
      // In a real implementation, this would schedule a retry job
      // For demo purposes, we'll just log it
      console.log(`Will retry webhook ${webhook.id} in ${retryDelayMs}ms`);
    }
    
    // Update webhook's last status
    this.webhooks.set(webhook.id, {
      ...webhook,
      lastStatus: {
        success,
        timestamp: new Date(),
        statusCode: delivery.statusCode,
        message: delivery.responseBody
      }
    });
    
    // Store the delivery record
    this.deliveries.push(delivery);
    
    return delivery;
  }
}

export default WebhooksService.getInstance();
