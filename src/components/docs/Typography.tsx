import { HTMLAttributes, AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Heading1({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mt-8 mb-4",
        className
      )}
      {...props}
    />
  );
}

export function Heading2({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10 mb-4",
        className
      )}
      {...props}
    />
  );
}

export function Heading3({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4",
        className
      )}
      {...props}
    />
  );
}

export function Heading4({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight mt-6 mb-2",
        className
      )}
      {...props}
    />
  );
}

export function Link({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        "font-medium text-primary underline underline-offset-4 hover:text-primary/80",
        className
      )}
      {...props}
    />
  );
}
