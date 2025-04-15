"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Mock model data for the showcase
const featuredModels = [
  { name: "Claude 3 Opus", provider: "Anthropic" },
  { name: "GPT-4o", provider: "OpenAI" },
  { name: "Gemini 1.5 Pro", provider: "Google" },
  { name: "Llama 3 70B", provider: "Meta" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-muted/30">
          <div className="container max-w-screen-lg mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Access the world's best LLMs with a single API
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              The unified API for Large Language Models. Talk to Claude, GPT-4, Gemini, and many more with a single API call.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/chat">Try Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs">View Documentation</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Models Showcase */}
        <section className="py-16 px-4 bg-background">
          <div className="container max-w-screen-lg mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Access Premium & Open-source Models</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From Claude and GPT-4 to open models like Llama 3, access the best AI language models through a single API.
            </p>
          </div>
          
          <div className="container max-w-screen-lg mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredModels.map((model, index) => (
                <Card key={index} className="border border-border/40">
                  <CardContent className="p-6">
                    <div className="text-lg font-medium mb-1">{model.name}</div>
                    <div className="text-sm text-muted-foreground">{model.provider}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container max-w-screen-lg mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Use OpenRouter Clone?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Simplify access to AI language models with our unified platform
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Single API</h3>
                <p className="text-muted-foreground">
                  Access multiple AI models through one unified API interface
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4"/>
                    <path d="M12 18v4"/>
                    <path d="M4.93 4.93l2.83 2.83"/>
                    <path d="M16.24 16.24l2.83 2.83"/>
                    <path d="M2 12h4"/>
                    <path d="M18 12h4"/>
                    <path d="M4.93 19.07l2.83-2.83"/>
                    <path d="M16.24 7.76l2.83-2.83"/>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Fallbacks & Routing</h3>
                <p className="text-muted-foreground">
                  Automatic model fallbacks ensure requests are always fulfilled
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                    <path d="M7 7h.01"/>
                    <path d="M17 7h.01"/>
                    <path d="M7 17h.01"/>
                    <path d="M17 17h.01"/>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Model Flexibility</h3>
                <p className="text-muted-foreground">
                  Mix and match models to optimize for cost, speed, or accuracy
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20 text-center">
          <div className="container max-w-screen-lg mx-auto">
            <h2 className="text-3xl font-bold mb-4">Start using OpenRouter Clone today</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers accessing the best AI models through a single API
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">Sign Up for Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border/40 bg-background">
        <div className="container max-w-screen-lg mx-auto py-8 px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-medium mb-3">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/chat" className="text-sm text-muted-foreground hover:text-foreground">Chat</Link></li>
                <li><Link href="/models" className="text-sm text-muted-foreground hover:text-foreground">Models</Link></li>
                <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-3">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">Documentation</Link></li>
                <li><Link href="/api" className="text-sm text-muted-foreground hover:text-foreground">API Reference</Link></li>
                <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-3">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-3">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link></li>
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/40 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} OpenRouter Clone. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
