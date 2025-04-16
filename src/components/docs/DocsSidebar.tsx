"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

type DocRoute = {
  title: string;
  href: string;
  children?: DocRoute[];
};

const docsRoutes: DocRoute[] = [
  {
    title: "Introduction",
    href: "/docs",
  },
  {
    title: "Quick Start",
    href: "/docs/quick-start",
  },
  {
    title: "API Keys",
    href: "/docs/api-keys",
  },
  {
    title: "Account Setup",
    href: "/docs/account-setup",
  },
  {
    title: "Platform Overview",
    href: "/docs/platform-overview",
  },
  {
    title: "Billing & Usage",
    href: "/docs/billing-usage",
  },
  {
    title: "API Reference",
    href: "/docs/api",
    children: [
      {
        title: "Overview",
        href: "/docs/api",
      },
      {
        title: "Authentication",
        href: "/docs/api/authentication",
      },
      {
        title: "Chat Completions",
        href: "/docs/api/chat-completion",
      },
      {
        title: "Streaming Responses",
        href: "/docs/api/streaming",
      },
      {
        title: "Models List",
        href: "/docs/api/models",
      },
      {
        title: "Function Calling",
        href: "/docs/api/function-calling",
      },
      {
        title: "Tool Use",
        href: "/docs/api/tool-use",
      },
      {
        title: "Vision & Images",
        href: "/docs/api/vision",
      },
      {
        title: "Rate Limits",
        href: "/docs/api/rate-limits",
      },
      {
        title: "Error Handling",
        href: "/docs/api/errors",
      },
      {
        title: "Versioning Policy",
        href: "/docs/api/versioning",
      },
    ],
  },
  {
    title: "Models",
    href: "/docs/models",
    children: [
      {
        title: "Overview",
        href: "/docs/models",
      },
      {
        title: "Model Selection Guide",
        href: "/docs/models/selection",
      },
      {
        title: "OpenAI Models",
        href: "/docs/models/openai",
      },
      {
        title: "Anthropic Models",
        href: "/docs/models/anthropic",
      },
      {
        title: "Google Models",
        href: "/docs/models/google",
      },
      {
        title: "Open Source Models",
        href: "/docs/models/open-source",
      },
      {
        title: "Model Comparison",
        href: "/docs/models/comparison",
      },
      {
        title: "Performance Metrics",
        href: "/docs/models/performance",
      },
      {
        title: "Pricing & Tokens",
        href: "/docs/models/pricing",
      },
      {
        title: "Context Windows",
        href: "/docs/models/context",
      },
    ],
  },
  {
    title: "Guides",
    href: "/docs/guides",
    children: [
      {
        title: "Overview",
        href: "/docs/guides",
      },
      {
        title: "Prompt Engineering",
        href: "/docs/guides/prompt-engineering",
      },
      {
        title: "System Prompts",
        href: "/docs/guides/system-prompts",
      },
      {
        title: "Few-shot Learning",
        href: "/docs/guides/few-shot-learning",
      },
      {
        title: "Fallbacks & Routing",
        href: "/docs/guides/fallbacks-routing",
      },
      {
        title: "Model Selection",
        href: "/docs/guides/model-selection",
      },
      {
        title: "Token Optimization",
        href: "/docs/guides/token-optimization",
      },
      {
        title: "Cost Management",
        href: "/docs/guides/cost-management",
      },
      {
        title: "Security Best Practices",
        href: "/docs/guides/security",
      },
      {
        title: "Building AI Assistants",
        href: "/docs/guides/ai-assistants",
      },
      {
        title: "RAG Implementation",
        href: "/docs/guides/rag",
      },
      {
        title: "Fine-tuning Guide",
        href: "/docs/guides/fine-tuning",
      },
    ],
  },
  {
    title: "SDK & Libraries",
    href: "/docs/sdk",
    children: [
      {
        title: "Overview",
        href: "/docs/sdk",
      },
      {
        title: "JavaScript/TypeScript",
        href: "/docs/sdk/javascript",
      },
      {
        title: "React Integration",
        href: "/docs/sdk/react",
      },
      {
        title: "Node.js Examples",
        href: "/docs/sdk/node-examples",
      },
      {
        title: "Python",
        href: "/docs/sdk/python",
      },
      {
        title: "Python Async",
        href: "/docs/sdk/python-async",
      },
      {
        title: "Python Frameworks",
        href: "/docs/sdk/python-frameworks",
      },
      {
        title: "Go Client",
        href: "/docs/sdk/go",
      },
      {
        title: "Ruby Client",
        href: "/docs/sdk/ruby",
      },
      {
        title: "Java Client",
        href: "/docs/sdk/java",
      },
      {
        title: "PHP Client",
        href: "/docs/sdk/php",
      },
      {
        title: "CLI Tool",
        href: "/docs/sdk/cli",
      },
    ],
  },
  {
    title: "Use Cases",
    href: "/docs/use-cases",
    children: [
      {
        title: "Overview",
        href: "/docs/use-cases",
      },
      {
        title: "Chatbots",
        href: "/docs/use-cases/chatbots",
      },
      {
        title: "Content Generation",
        href: "/docs/use-cases/content-generation",
      },
      {
        title: "Customer Support",
        href: "/docs/use-cases/customer-support",
      },
      {
        title: "Data Analysis",
        href: "/docs/use-cases/data-analysis",
      },
      {
        title: "Code Generation",
        href: "/docs/use-cases/code-generation",
      },
      {
        title: "Education",
        href: "/docs/use-cases/education",
      },
      {
        title: "Enterprise Solutions",
        href: "/docs/use-cases/enterprise",
      },
      {
        title: "Healthcare Applications",
        href: "/docs/use-cases/healthcare",
      },
    ],
  },
  {
    title: "Advanced Features",
    href: "/docs/advanced-features",
    children: [
      {
        title: "Overview",
        href: "/docs/advanced-features",
      },
      {
        title: "Load Balancing",
        href: "/docs/advanced-features/load-balancing",
      },
      {
        title: "Custom Endpoints",
        href: "/docs/advanced-features/custom-endpoints",
      },
      {
        title: "Webhooks",
        href: "/docs/advanced-features/webhooks",
      },
      {
        title: "Caching Strategies",
        href: "/docs/advanced-features/caching",
      },
      {
        title: "Batch Processing",
        href: "/docs/advanced-features/batch-processing",
      },
      {
        title: "Analytics & Logging",
        href: "/docs/advanced-features/analytics",
      },
      {
        title: "Enterprise SSO",
        href: "/docs/advanced-features/enterprise-sso",
      },
      {
        title: "API Playground",
        href: "/docs/advanced-features/playground",
      },
    ],
  },
  {
    title: "Deployment",
    href: "/docs/deployment",
    children: [
      {
        title: "Overview",
        href: "/docs/deployment",
      },
      {
        title: "Production Readiness",
        href: "/docs/deployment/production",
      },
      {
        title: "Scalability",
        href: "/docs/deployment/scalability",
      },
      {
        title: "High Availability",
        href: "/docs/deployment/high-availability",
      },
      {
        title: "Multi-Region",
        href: "/docs/deployment/multi-region",
      },
      {
        title: "Private Cloud",
        href: "/docs/deployment/private-cloud",
      },
      {
        title: "On-Premises",
        href: "/docs/deployment/on-premises",
      },
    ],
  },
  {
    title: "Reference",
    href: "/docs/reference",
    children: [
      {
        title: "Glossary",
        href: "/docs/reference/glossary",
      },
      {
        title: "FAQ",
        href: "/docs/reference/faq",
      },
      {
        title: "Troubleshooting",
        href: "/docs/reference/troubleshooting",
      },
      {
        title: "Status Page",
        href: "/docs/reference/status",
      },
      {
        title: "Changelog",
        href: "/docs/reference/changelog",
      },
      {
        title: "Migration Guides",
        href: "/docs/reference/migration",
      },
      {
        title: "Community Resources",
        href: "/docs/reference/community",
      },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => {
      const initialState: Record<string, boolean> = {};

      // Initially open the section that contains the current page
      docsRoutes.forEach((route) => {
        const isActive =
          pathname.startsWith(route.href) ||
          (route.children?.some((child) => pathname === child.href) ?? false);
        initialState[route.href] = isActive;
      });

      return initialState;
    }
  );

  const toggleSection = (href: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  const isRouteActive = (route: DocRoute, strict: boolean = false) => {
    if (strict) {
      return pathname === route.href;
    }
    return pathname === route.href || pathname.startsWith(`${route.href}/`);
  };

  return (
    <aside className="w-72 flex-shrink-0 h-[inherit] overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 flex flex-col">
      <div className="sticky top-0 z-10 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-b border-gray-100 dark:border-gray-800 px-4 py-5">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          Documentation
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full mt-1"></div>
      </div>

      <div className="flex flex-col justify-between flex-1 overflow-hidden">
        <nav className="p-4 space-y-1 overflow-y-scroll flex-1">
          {docsRoutes.map((section) => {
            const isActiveStrict = isRouteActive(section, true);

            if (!section.children) {
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={cn(
                    "flex items-center text-sm py-1.5 px-3 rounded-md transition-all group",
                    isActiveStrict
                      ? "font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                  )}
                >
                  <div className="flex items-center">
                    {isActiveStrict ? (
                      <div className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                    ) : (
                      <div className="mr-2 h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}
                    {section.title}
                  </div>
                </Link>
              );
            }
            
            const isActive = isRouteActive(section);
            const isOpen = openSections[section.href] ?? false;

            return (
              <div key={section.href} className="mb-2">
                <button
                  onClick={() => toggleSection(section.href)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                    isActive
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {getIconForSection(section.title)}
                    <span>{section.title}</span>
                  </div>
                  <span
                    className={cn(
                      "text-gray-400 dark:text-gray-500 transform transition-transform duration-200",
                      isOpen ? "rotate-180" : ""
                    )}
                  >
                    <ChevronDownIcon />
                  </span>
                </button>

                {(isOpen || isActive) && section.children && (
                  <div className="pl-10 mt-1 space-y-1">
                    {section.children.map((item) => {
                      const isItemActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center text-sm py-1.5 px-3 rounded-md transition-all group",
                            isItemActive
                              ? "font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                          )}
                        >
                          <div className="flex items-center">
                            {isItemActive ? (
                              <div className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                            ) : (
                              <div className="mr-2 h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            )}
                            {item.title}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="m-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/30 shadow-sm">
          <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
            Need help?
          </h3>
          <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mb-3">
            Our support team is just a click away to assist you with any
            questions.
          </p>
          <Link
            href="/support"
            className="text-xs font-medium inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 transition-colors"
          >
            <SupportIcon />
            <span className="ml-1.5">Contact support</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

function getIconForSection(title: string) {
  switch (title) {
    case "Getting Started":
      return <RocketIcon />;
    case "API Reference":
      return <CodeIcon />;
    case "Models":
      return <CubeIcon />;
    case "Guides":
      return <BookOpenIcon />;
    case "SDK & Libraries":
      return <PackageIcon />;
    case "Use Cases":
      return <UseCasesIcon />;
    case "Advanced Features":
      return <AdvancedFeaturesIcon />;
    case "Deployment":
      return <DeploymentIcon />;
    case "Reference":
      return <ReferenceIcon />;
    default:
      return <DocumentIcon />;
  }
}

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-emerald-500 dark:text-emerald-400"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-indigo-500 dark:text-indigo-400"
    >
      <path d="m8 18 4-14 4 14" />
      <path d="m2 8 10 8 10-8" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-fuchsia-500 dark:text-fuchsia-400"
    >
      <path d="m21 7.5-9-4.5L3 7.5" />
      <path d="m21 7.5-9 4.5-9-4.5" />
      <path d="M3 7.5v9l9 4.5" />
      <path d="M21 7.5v9l-9 4.5" />
      <path d="M3.3 7.3 12 12l8.7-4.7" />
    </svg>
  );
}

function BookOpenIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-amber-500 dark:text-amber-400"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-rose-500 dark:text-rose-400"
    >
      <path d="M3 9v7.4A2.6 2.6 0 0 0 5.6 19h12.8a2.6 2.6 0 0 0 2.6-2.6V9" />
      <path d="M3.8 5.4A2.6 2.6 0 0 1 6.4 3h11.2a2.6 2.6 0 0 1 2.6 2.4" />
      <path d="M12 10v6" />
      <path d="m8 12 4-2 4 2" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-blue-500 dark:text-blue-400"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9.09 9 .5.5A2.5 2.5 0 1 1 12 13" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function UseCasesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-green-500 dark:text-green-400"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function AdvancedFeaturesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-purple-500 dark:text-purple-400"
    >
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}

function DeploymentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-cyan-500 dark:text-cyan-400"
    >
      <path d="M17 12h.01" />
      <path d="M19 12h.01" />
      <path d="M21 12h.01" />
      <path d="M21 8V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" />
      <path d="M10 8v8" />
      <path d="M7 8v8" />
      <path d="M17 16v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function ReferenceIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-orange-500 dark:text-orange-400"
    >
      <path d="M10 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5L10 2" />
      <path d="M9 10h6" />
      <path d="M9 14h6" />
      <path d="M9 18h3" />
    </svg>
  );
}
