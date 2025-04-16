import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import batchProcessor from "@/lib/batch-processor";
import { ModelRequestSchema } from "@/lib/models";

export const runtime = "edge";

// Mock authentication function - in a real app, use a proper auth system
function getAuthenticatedUser(req: NextRequest) {
  const userId = req.headers.get("x-user-id") || "user-123"; 
  return { id: userId };
}

// Schema for batch request creation
const BatchRequestSchema = z.object({
  requests: z.array(z.any()), // Will validate each request separately
  priority: z.enum(['low', 'normal', 'high']).optional(),
  callbackUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

// GET batch requests
export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    
    const url = new URL(req.url);
    const batchId = url.searchParams.get('id');
    const statsOnly = url.searchParams.get('stats') === 'true';
    
    if (statsOnly) {
      // Return batch processing statistics
      const stats = batchProcessor.getStats(user.id);
      return NextResponse.json({ stats });
    }
    
    if (batchId) {
      // Get specific batch
      const batch = batchProcessor.getBatch(batchId, user.id);
      
      if (!batch) {
        return NextResponse.json(
          { error: "Batch not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ batch });
    }
    
    // List all batches for the user
    const batches = batchProcessor.getUserBatches(user.id);
    return NextResponse.json({ batches });
    
  } catch (error: any) {
    console.error("Error in batch API:", error);
    
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 }
    );
  }
}

// Create new batch request
export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    const body = await req.json();
    
    // Validate the batch request
    try {
      BatchRequestSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid batch request", details: error.format() },
          { status: 400 }
        );
      }
      throw error;
    }
    
    // Validate each individual request in the batch
    const validRequests = [];
    const invalidRequests = [];
    
    for (const request of body.requests) {
      try {
        const validatedRequest = ModelRequestSchema.parse(request);
        validRequests.push(validatedRequest);
      } catch (error) {
        invalidRequests.push({
          request,
          error: error instanceof z.ZodError ? error.format() : "Invalid request"
        });
      }
    }
    
    if (validRequests.length === 0) {
      return NextResponse.json(
        { error: "No valid requests in batch", invalidRequests },
        { status: 400 }
      );
    }
    
    // Create the batch
    const batch = batchProcessor.createBatch(
      user.id,
      validRequests,
      {
        priority: body.priority,
        callbackUrl: body.callbackUrl,
        metadata: body.metadata
      }
    );
    
    return NextResponse.json({
      batch,
      validRequests: validRequests.length,
      invalidRequests: invalidRequests.length > 0 ? invalidRequests : undefined,
      message: "Batch request created successfully"
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating batch request:", error);
    
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 }
    );
  }
}

// Cancel batch request
export async function DELETE(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    const url = new URL(req.url);
    const batchId = url.searchParams.get('id');
    
    if (!batchId) {
      return NextResponse.json(
        { error: "Batch ID is required" },
        { status: 400 }
      );
    }
    
    // Cancel the batch
    const success = batchProcessor.cancelBatch(batchId, user.id);
    
    if (!success) {
      return NextResponse.json(
        { error: "Batch not found or cannot be cancelled" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: "Batch cancelled successfully" 
    });
    
  } catch (error: any) {
    console.error("Error cancelling batch:", error);
    
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 }
    );
  }
}