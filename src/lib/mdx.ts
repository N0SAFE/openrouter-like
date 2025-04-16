import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { serialize } from "next-mdx-remote/serialize";

const docsDirectory = path.join(process.cwd(), "src/docs");

export async function getDocBySlug(slug: string[]) {
  const realSlug = slug.join("/") || "index";

  function getFileOrFolderIndex(slug: string) {
    const folderPath = path.join(docsDirectory, slug);
    if (fs.existsSync(folderPath)) {
      return folderPath;
    }
    const filePath = path.join(docsDirectory, `${slug}.mdx`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }

    return null;
  }
  const fileOrFolderPath = getFileOrFolderIndex(realSlug);
  if (!fileOrFolderPath) {
    return null;
  }

  const filePath = fs.statSync(fileOrFolderPath).isDirectory()
    ? path.join(fileOrFolderPath, "index.mdx")
    : fileOrFolderPath;

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(fileContents);

  const mdxSource = await serialize(content, {
    mdxOptions: {
      rehypePlugins: [rehypeHighlight, rehypeSlug],
      remarkPlugins: [remarkGfm],
    },
    parseFrontmatter: true,
  });

  return {
    source: mdxSource,
    frontmatter: data,
    slug: realSlug,
  };
}

export async function getAllDocs() {
  const slugs = getAllDocSlugs();
  const docs = [];

  for (const slug of slugs) {
    const doc = await getDocBySlug(slug);
    if (doc) {
      docs.push(doc);
    }
  }

  return docs;
}

export function getAllDocSlugs() {
  return walkDirectory(docsDirectory).map((filePath) => {
    const relativePath = filePath.replace(`${docsDirectory}/`, "");
    const slug = relativePath.replace(/\.mdx$/, "").split("/");
    return slug;
  });
}

function walkDirectory(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  let filePaths: string[] = [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      filePaths = [...filePaths, ...walkDirectory(fullPath)];
    } else if (entry.name.endsWith(".mdx")) {
      filePaths.push(fullPath);
    }
  }

  return filePaths;
}
