"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ModelSidebar } from "@/components/models/ModelSidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Mock models data structured by category
const modelsByCategory = {
  popular: [
    {
      id: "anthropic/claude-3-opus",
      name: "Claude 3 Opus",
      provider: "Anthropic",
      context: "200k",
      type: "chat",
      tags: ["premium"],
      description:
        "Anthropic's most powerful model with enhanced reasoning and context understanding capabilities.",
    },
    {
      id: "openai/gpt-4o",
      name: "GPT-4o",
      provider: "OpenAI",
      context: "128k",
      type: "chat",
      tags: [],
      description:
        "OpenAI's most capable model optimized for both vision and language tasks.",
    },
    {
      id: "google/gemini-1.5-pro",
      name: "Gemini 1.5 Pro",
      provider: "Google",
      context: "1m",
      type: "chat",
      tags: [],
      description:
        "Google's multimodal model with extensive context window and strong reasoning abilities.",
    },
  ],
  all: [
    {
      id: "anthropic/claude-3-opus",
      name: "Claude 3 Opus",
      provider: "Anthropic",
      context: "200k",
      type: "chat",
      tags: ["premium"],
      description:
        "Anthropic's most powerful model with enhanced reasoning and context understanding capabilities.",
    },
    {
      id: "anthropic/claude-3-sonnet",
      name: "Claude 3 Sonnet",
      provider: "Anthropic",
      context: "200k",
      type: "chat",
      tags: [],
      description:
        "A balanced model from Anthropic that combines intelligence and speed.",
    },
    {
      id: "google/gemini-1.5-pro",
      name: "Gemini 1.5 Pro",
      provider: "Google",
      context: "1m",
      type: "chat",
      tags: [],
      description:
        "Google's multimodal model with extensive context window and strong reasoning abilities.",
    },
    {
      id: "openai/gpt-4o",
      name: "GPT-4o",
      provider: "OpenAI",
      context: "128k",
      type: "chat",
      tags: [],
      description:
        "OpenAI's most capable model optimized for both vision and language tasks.",
    },
    {
      id: "meta-llama/llama-3-70b-instruct",
      name: "Llama 3 70B",
      provider: "Meta",
      context: "8k",
      type: "chat",
      tags: ["open"],
      description:
        "Meta's largest open-source model with strong instruction following capabilities.",
    },
    {
      id: "anthropic/claude-3-haiku",
      name: "Claude 3 Haiku",
      provider: "Anthropic",
      context: "200k",
      type: "chat",
      tags: [],
      description:
        "Anthropic's fastest and most compact model, optimized for high throughput.",
    },
    {
      id: "openai/gpt-4-turbo",
      name: "GPT-4 Turbo",
      provider: "OpenAI",
      context: "128k",
      type: "chat",
      tags: [],
      description:
        "A powerful model balancing capability and cost, with a large context window.",
    },
    {
      id: "meta-llama/llama-3-8b-instruct",
      name: "Llama 3 8B",
      provider: "Meta",
      context: "8k",
      type: "chat",
      tags: ["open"],
      description:
        "Smaller, faster open-source model from Meta suitable for deployment on consumer hardware.",
    },
  ],
  anthropic: [
    {
      id: "anthropic/claude-3-opus",
      name: "Claude 3 Opus",
      provider: "Anthropic",
      context: "200k",
      type: "chat",
      tags: ["premium"],
      description:
        "Anthropic's most powerful model with enhanced reasoning and context understanding capabilities.",
    },
    {
      id: "anthropic/claude-3-sonnet",
      name: "Claude 3 Sonnet",
      provider: "Anthropic",
      context: "200k",
      type: "chat",
      tags: [],
      description:
        "A balanced model from Anthropic that combines intelligence and speed.",
    },
    {
      id: "anthropic/claude-3-haiku",
      name: "Claude 3 Haiku",
      provider: "Anthropic",
      context: "200k",
      type: "chat",
      tags: [],
      description:
        "Anthropic's fastest and most compact model, optimized for high throughput.",
    },
  ],
  openai: [
    {
      id: "openai/gpt-4o",
      name: "GPT-4o",
      provider: "OpenAI",
      context: "128k",
      type: "chat",
      tags: [],
      description:
        "OpenAI's most capable model optimized for both vision and language tasks.",
    },
    {
      id: "openai/gpt-4-turbo",
      name: "GPT-4 Turbo",
      provider: "OpenAI",
      context: "128k",
      type: "chat",
      tags: [],
      description:
        "A powerful model balancing capability and cost, with a large context window.",
    },
    {
      id: "openai/gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      provider: "OpenAI",
      context: "16k",
      type: "chat",
      tags: [],
      description:
        "Efficient model suitable for general-purpose tasks with a good balance of cost and performance.",
    },
  ],
  meta: [
    {
      id: "meta-llama/llama-3-70b-instruct",
      name: "Llama 3 70B",
      provider: "Meta",
      context: "8k",
      type: "chat",
      tags: ["open"],
      description:
        "Meta's largest open-source model with strong instruction following capabilities.",
    },
    {
      id: "meta-llama/llama-3-8b-instruct",
      name: "Llama 3 8B",
      provider: "Meta",
      context: "8k",
      type: "chat",
      tags: ["open"],
      description:
        "Smaller, faster open-source model from Meta suitable for deployment on consumer hardware.",
    },
  ],
  google: [
    {
      id: "google/gemini-1.5-pro",
      name: "Gemini 1.5 Pro",
      provider: "Google",
      context: "1m",
      type: "chat",
      tags: [],
      description:
        "Google's multimodal model with extensive context window and strong reasoning abilities.",
    },
    {
      id: "google/gemini-1.5-flash",
      name: "Gemini 1.5 Flash",
      provider: "Google",
      context: "1m",
      type: "chat",
      tags: [],
      description:
        "A faster version of Gemini optimized for efficient, high-throughput applications.",
    },
  ],
};

export default function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="flex-1 container mx-auto py-8 px-4">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Models Library</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Browse the complete collection of AI models available through our
          unified API.
        </p>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="all">All Models</TabsTrigger>
            <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="google">Google</TabsTrigger>
            <TabsTrigger value="meta">Meta</TabsTrigger>
          </TabsList>

          {Object.keys(modelsByCategory).map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modelsByCategory[category].map((model) => (
                  <Card key={model.id} className="flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{model.name}</CardTitle>
                        <div className="flex gap-2">
                          {model.tags.includes("premium") && (
                            <Badge variant="secondary">Premium</Badge>
                          )}
                          {model.tags.includes("open") && (
                            <Badge variant="outline">Open Source</Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <span>{model.provider}</span>
                        <span className="text-xs px-2 py-1 bg-muted rounded-full">
                          Context: {model.context}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground flex-1">
                      <p>{model.description}</p>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button variant="outline" className="w-full" asChild>
                        <a href={`/chat?model=${model.id}`}>
                          Chat with {model.name}
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
}
