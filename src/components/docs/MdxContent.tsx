
'use client'
import { Heading1, Heading2, Heading3, Heading4, Link } from "./Typography";
import { CodeBlock } from "./CodeBlock";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { ReactNode } from "react";

// Custom Pre component that extracts language information from className
const Pre = (props: any) => {
  // Extract language from className (comes from markdown ```) or from children's className
  const className = props.className || '';
  const childClassName = props.children?.props?.className || '';
  
  // Check both the pre tag and code tag for language info
  const preMatches = className.match(/language-(\w+)/);
  const childMatches = childClassName.match(/language-(\w+)/);
  
  const language = preMatches ? preMatches[1] : childMatches ? childMatches[1] : '';
  
  return <CodeBlock language={language} {...props} />;
};

const components = {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  a: Link,
  pre: Pre,
};

export function MdxContent({ source }: { source: MDXRemoteSerializeResult }) {
  console.log(source)
  return (
    <div className="mdx-content prose prose-slate dark:prose-invert max-w-none">
      <MDXRemote {...source} components={components} />
    </div>
  );
}
