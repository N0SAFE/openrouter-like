import { Header } from "@/components/layout/Header";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { MdxContent } from "@/components/docs/MdxContent";
import { getDocBySlug } from "@/lib/mdx";
import { notFound } from "next/navigation";

export default async function DocsLayout({
  params,
  children
}: 
  React.PropsWithChildren<{params: Promise<{ folder?: string[] }>}>
) {
  const { folder } = await params;
  // Get the folder path for the current doc
  const folderPath = folder || ["index"];

  console.log(folderPath)
  
  // Fetch the document content server-side
  const doc = await getDocBySlug(folderPath);
  
  // If the document doesn't exist, show a 404 page
  if (!doc) {
    notFound();
  }
  
  return (
    
      <div className="flex flex-1 overflow-hidden">
        <DocsSidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
  );
}
