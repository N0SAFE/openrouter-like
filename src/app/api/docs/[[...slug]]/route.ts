import { NextResponse } from "next/server";
import { getDocBySlug } from "@/lib/mdx";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
    const { slug } = await params;
  try {
    // Convert slug array to path string or use 'index' for root
    const slugPath = slug || "index";
    
    // Get the document content
    const doc = await getDocBySlug(slugPath);
    
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    
    return NextResponse.json(doc);
  } catch (error) {
    console.error("Error fetching doc:", error);
    return NextResponse.json(
      { error: "Failed to load document" },
      { status: 500 }
    );
  }
}
