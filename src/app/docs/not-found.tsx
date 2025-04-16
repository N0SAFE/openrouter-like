"use client";

import Link from "next/link";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { Header } from "@/components/layout/Header";

export default function DocsNotFound() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <DocsSidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="max-w-3xl mx-auto flex flex-col items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-6">
                404
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full mx-auto mb-8"></div>
              <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Documentation Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                Sorry, we couldn&apos;t find the documentation page you&apos;re looking for. 
                It might have been moved, renamed, or it doesn&apos;t exist yet.
              </p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-lg max-w-md mx-auto">
                  <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                    What you can do:
                  </h3>
                  <ul className="text-sm text-blue-600/80 dark:text-blue-400/80 space-y-2 list-disc pl-5">
                    <li>Check that the URL is correct</li>
                    <li>Browse the documentation using the sidebar</li>
                    <li>Return to the documentation homepage</li>
                    <li>Contact us if you believe this is an error</li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <Link 
                    href="/docs" 
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
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
                      className="mr-2"
                    >
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                    Documentation Home
                  </Link>
                  <Link 
                    href="/support" 
                    className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
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
                      className="mr-2"
                    >
                      <circle cx="12" cy="12" r="10"/>
                      <path d="m9.09 9 .5.5A2.5 2.5 0 1 1 12 13"/>
                      <path d="M12 17h.01"/>
                    </svg>
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
