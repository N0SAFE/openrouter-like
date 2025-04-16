import { NextRequest, NextResponse } from "next/server";
import { models, getModelById, getModelsByProvider, getModelsByFeature } from "@/lib/models";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const modelId = url.searchParams.get('id');
    const provider = url.searchParams.get('provider') as any;
    const feature = url.searchParams.get('feature') as any;
    
    // If a specific model ID is requested
    if (modelId) {
      const model = getModelById(modelId);
      if (!model) {
        return NextResponse.json(
          { error: `Model ${modelId} not found` },
          { status: 404 }
        );
      }
      return NextResponse.json({ model });
    }
    
    // If filtering by provider
    if (provider) {
      const providerModels = getModelsByProvider(provider);
      return NextResponse.json({ models: providerModels });
    }
    
    // If filtering by feature
    if (feature) {
      const featureModels = getModelsByFeature(feature);
      return NextResponse.json({ models: featureModels });
    }
    
    // Default: return all models
    return NextResponse.json({ models: Object.values(models) });
    
  } catch (error: any) {
    console.error("Error in models API:", error);
    
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 }
    );
  }
}
