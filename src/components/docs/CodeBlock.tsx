import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
  children?: ReactNode;
  language?: string;
  filename?: string;
}

export function CodeBlock({ className, language, filename, ...props }: CodeBlockProps) {
  console.log('CodeBlock props:', { className, language, filename, ...props });
  return (
    <div className="relative my-6 rounded-lg border bg-muted p-0">
      {(language || filename) && (
        <div className="absolute right-3 top-1 flex items-center gap-2">
          {filename && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
              {filename}
            </span>
          )}
          {language && (
            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded font-mono">
              {language}
            </span>
          )}
        </div>
      )}
      <pre className={cn("overflow-x-auto py-4 text-sm leading-[1.5] px-4", className)} {...props} />
    </div>
  );
}
