"use client";

import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";
import { Heading1, Heading2, Heading3, Heading4, Link } from "./Typography";
import { CodeBlock } from "./CodeBlock";

const components = {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  a: Link,
  pre: CodeBlock,
};

export function MdxContent({ source }: { source: MDXRemoteProps }) {
  return (
    <div className="mdx-content prose prose-slate dark:prose-invert max-w-none">
      <MDXRemote {...source} components={components} />
    </div>
  );
}
