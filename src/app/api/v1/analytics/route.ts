import { NextRequest, NextResponse } from "next/server";
import analyticsService, { UsageQuery } from "@/lib/analytics";

export const runtime = "edge";

// Mock authentication function - in a real app, use a proper auth system
function getAuthenticatedUser(req: NextRequest) {
  const userId = req.headers.get("x-user-id") || "user-123"; 
  return { id: userId };
}

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    const url = new URL(req.url);
    
    // Parse query parameters
    const query: UsageQuery = {
      userId: user.id,
      startDate: url.searchParams.get('startDate') ? new Date(url.searchParams.get('startDate')!) : undefined,
      endDate: url.searchParams.get('endDate') ? new Date(url.searchParams.get('endDate')!) : undefined,
      models: url.searchParams.get('models') ? url.searchParams.get('models')!.split(',') : undefined,
      endpointId: url.searchParams.get('endpointId') || undefined,
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!, 10) : undefined,
      page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!, 10) : undefined,
    };
    
    // Check if metrics or detailed records are requested
    const metricsOnly = url.searchParams.get('metricsOnly') === 'true';
    
    if (metricsOnly) {
      const metrics = analyticsService.getMetrics(query);
      return NextResponse.json({ metrics });
    } else {
      const records = analyticsService.queryUsage(query);
      const metrics = analyticsService.getMetrics(query);
      return NextResponse.json({ records, metrics });
    }
    
  } catch (error: any) {
    console.error("Error in analytics API:", error);
    
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 }
    );
  }
}
