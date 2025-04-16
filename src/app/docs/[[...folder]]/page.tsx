import { Header } from "@/components/layout/Header";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { MdxContent } from "@/components/docs/MdxContent";
import { getDocBySlug } from "@/lib/mdx";
import { notFound } from "next/navigation";

export default async function DocsPage({
  params,
}: {
  params: Promise<{ folder?: string[] }>;
}) {
  const { folder } = await params;
  // Get the folder path for the current doc
  const folderPath = folder || ["index"];

  console.log(folderPath);

  // Fetch the document content server-side
  const doc = await getDocBySlug(folderPath);

  // If the document doesn't exist, show a 404 page
  if (!doc) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <MdxContent source={doc.source} />
    </div>
  );
}
