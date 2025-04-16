import { NextRequest, NextResponse } from "next/server";
import customEndpoints, { CustomEndpointSchema } from "@/lib/custom-endpoints";
import { z } from "zod";

export const runtime = "edge";

// Mock authentication function - in a real app, use a proper auth system
function getAuthenticatedUser(req: NextRequest) {
  // This is just a placeholder for demonstration
  const userId = req.headers.get("x-user-id") || "user-123"; 
  return { id: userId };
}

// GET endpoints (list or get specific endpoint)
export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    
    const url = new URL(req.url);
    const endpointId = url.searchParams.get('id');
    
    if (endpointId) {
      // Get specific endpoint
      const endpoint = customEndpoints.getEndpoint(endpointId);
      
      // Check if endpoint exists and user has access
      if (!endpoint || (endpoint.owner !== user.id && !endpoint.isPublic)) {
        return NextResponse.json(
          { error: "Endpoint not found or access denied" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ endpoint });
    }
    
    // List endpoints for the user
    const endpoints = customEndpoints.listEndpoints(user.id);
    return NextResponse.json({ endpoints });
    
  } catch (error: any) {
    console.error("Error in custom endpoints API:", error);
    
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 }
    );
  }
}

// Create new endpoint
export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    const body = await req.json();
    
    // Validate the endpoint config
    try {
      CustomEndpointSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid endpoint configuration", details: error.format() },
          { status: 400 }
        );
      }
      throw error;
    }
    
    // Create the endpoint
    const endpoint = customEndpoints.createEndpoint(body, user.id);
    
    return NextResponse.json({ 
      endpoint,
      message: "Custom endpoint created successfully" 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating custom endpoint:", error);
    
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 }
    );
  }
}

// Update existing endpoint
export async function PUT(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: "Endpoint ID is required" },
        { status: 400 }
      );
    }
    
    // Update the endpoint
    const endpoint = customEndpoints.updateEndpoint(body.id, body, user.id);
    
    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint not found or access denied" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      endpoint,
      message: "Custom endpoint updated successfully" 
    });
    
  } catch (error: any) {
    console.error("Error updating custom endpoint:", error);
    
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 }
    );
  }
}

// Delete endpoint
export async function DELETE(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    const url = new URL(req.url);
    const endpointId = url.searchParams.get('id');
    
    if (!endpointId) {
      return NextResponse.json(
        { error: "Endpoint ID is required" },
        { status: 400 }
      );
    }
    
    // Delete the endpoint
    const success = customEndpoints.deleteEndpoint(endpointId, user.id);
    
    if (!success) {
      return NextResponse.json(
        { error: "Endpoint not found or access denied" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: "Custom endpoint deleted successfully" 
    });
    
  } catch (error: any) {
    console.error("Error deleting custom endpoint:", error);
    
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 }
    );
  }
}
