import { NextRequest, NextResponse } from "next/server";
import webhooksService, { WebhookEventType } from "@/lib/webhooks";
import { z } from "zod";

export const runtime = "edge";

// Mock authentication function - in a real app, use a proper auth system
function getAuthenticatedUser(req: NextRequest) {
  const userId = req.headers.get("x-user-id") || "user-123"; 
  return { id: userId };
}

// Webhook creation schema validation
const WebhookCreateSchema = z.object({
  url: z.string().url(),
  name: z.string().min(1).max(100),
  events: z.array(z.string()),
  description: z.string().optional(),
  secret: z.string().optional(),
  headers: z.record(z.string()).optional(),
  retries: z.number().int().min(0).max(10).optional(),
});

// Webhook update schema validation
const WebhookUpdateSchema = z.object({
  url: z.string().url().optional(),
  name: z.string().min(1).max(100).optional(),
  events: z.array(z.string()).optional(),
  description: z.string().optional(),
  secret: z.string().optional(),
  headers: z.record(z.string()).optional(),
  retries: z.number().int().min(0).max(10).optional(),
  active: z.boolean().optional(),
});

// GET webhooks (list or get specific webhook)
export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    
    const url = new URL(req.url);
    const webhookId = url.searchParams.get('id');
    const eventType = url.searchParams.get('eventType') as WebhookEventType | null;
    const activeOnly = url.searchParams.get('active') === 'true';
    
    if (webhookId) {
      // Get specific webhook
      const webhook = webhooksService.getWebhook(webhookId);
      
      // Check if webhook exists and user has access
      if (!webhook || webhook.userId !== user.id) {
        return NextResponse.json(
          { error: "Webhook not found or access denied" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ webhook });
    }
    
    // List webhooks with optional filtering
    const webhooks = webhooksService.listWebhooks({
      userId: user.id,
      eventType: eventType || undefined,
      active: activeOnly ? true : undefined
    });
    
    return NextResponse.json({ webhooks });
    
  } catch (error: any) {
    console.error("Error in webhooks API:", error);
    
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 }
    );
  }
}

// Create new webhook
export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    const body = await req.json();
    
    // Validate the webhook config
    try {
      WebhookCreateSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid webhook configuration", details: error.format() },
          { status: 400 }
        );
      }
      throw error;
    }
    
    // Validate event types
    const validEventTypes: WebhookEventType[] = [
      'request.created', 'request.completed', 'request.failed',
      'model.unavailable', 'model.fallback', 'endpoint.created',
      'endpoint.updated', 'endpoint.deleted', 'credit.low', 'error'
    ];
    
    const events = body.events.filter(
      (event: string) => validEventTypes.includes(event as WebhookEventType)
    ) as WebhookEventType[];
    
    if (events.length === 0) {
      return NextResponse.json(
        { error: "At least one valid event type is required" },
        { status: 400 }
      );
    }
    
    // Create the webhook
    const webhook = webhooksService.createWebhook(
      user.id,
      body.url,
      body.name,
      events,
      {
        description: body.description,
        secret: body.secret,
        headers: body.headers,
        retries: body.retries
      }
    );
    
    return NextResponse.json({ 
      webhook,
      message: "Webhook created successfully" 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating webhook:", error);
    
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 }
    );
  }
}

// Update existing webhook
export async function PUT(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: "Webhook ID is required" },
        { status: 400 }
      );
    }
    
    // Validate the webhook update
    try {
      WebhookUpdateSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid webhook update", details: error.format() },
          { status: 400 }
        );
      }
      throw error;
    }
    
    // Validate event types if provided
    if (body.events) {
      const validEventTypes: WebhookEventType[] = [
        'request.created', 'request.completed', 'request.failed',
        'model.unavailable', 'model.fallback', 'endpoint.created',
        'endpoint.updated', 'endpoint.deleted', 'credit.low', 'error'
      ];
      
      body.events = body.events.filter(
        (event: string) => validEventTypes.includes(event as WebhookEventType)
      );
      
      if (body.events.length === 0) {
        return NextResponse.json(
          { error: "At least one valid event type is required" },
          { status: 400 }
        );
      }
    }
    
    // Update the webhook
    const webhook = webhooksService.updateWebhook(body.id, user.id, body);
    
    if (!webhook) {
      return NextResponse.json(
        { error: "Webhook not found or access denied" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      webhook,
      message: "Webhook updated successfully" 
    });
    
  } catch (error: any) {
    console.error("Error updating webhook:", error);
    
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 }
    );
  }
}

// Delete webhook
export async function DELETE(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    const url = new URL(req.url);
    const webhookId = url.searchParams.get('id');
    
    if (!webhookId) {
      return NextResponse.json(
        { error: "Webhook ID is required" },
        { status: 400 }
      );
    }
    
    // Delete the webhook
    const success = webhooksService.deleteWebhook(webhookId, user.id);
    
    if (!success) {
      return NextResponse.json(
        { error: "Webhook not found or access denied" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: "Webhook deleted successfully" 
    });
    
  } catch (error: any) {
    console.error("Error deleting webhook:", error);
    
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 }
    );
  }
}
