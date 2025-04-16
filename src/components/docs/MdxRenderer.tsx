"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// This is a client-side renderer for MDX content
export function MdxRenderer({ docPath }: { docPath: string }) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadDoc() {
      setLoading(true);
      try {
        // Extract the path segments, removing any leading/trailing slashes
        const pathSegments = docPath.split("/").filter(Boolean);
        
        // Fetch the MDX content from our API route
        const response = await fetch(`/api/docs/${pathSegments.join("/") || "index"}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load documentation: ${response.status}`);
        }
        
        const data = await response.json();
        setContent(data.content);
        setError(null);
      } catch (err) {
        console.error("Error loading doc:", err);
        setError("Failed to load documentation. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadDoc();
  }, [docPath]);

  if (loading) {
    return <div className="py-10 text-center">Loading documentation...</div>;
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => router.push("/docs")}
          className="mt-4 px-4 py-2 rounded bg-primary text-primary-foreground"
        >
          Return to Documentation Home
        </button>
      </div>
    );
  }

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none
      prose-headings:scroll-mt-16 prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl
      prose-pre:rounded-lg prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
      prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:before:content-none prose-code:after:content-none
      prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-800 hover:dark:prose-a:text-blue-300
      prose-img:rounded-lg prose-img:shadow-md">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}

// Helper function to generate mock content based on the path
function generateMockContent(path: string): string {
  const pathSegments = path.split("/").filter(Boolean);
  
  if (pathSegments.length === 0) {
    // Main documentation page
    return `
      <h1>OpenRouter API Documentation</h1>
      <p>Welcome to the OpenRouter API documentation. This guide will help you integrate with our unified API for accessing various large language models.</p>
      
      <h2>Getting Started</h2>
      <p>OpenRouter provides a single API endpoint to access a wide range of LLMs including models from OpenAI, Anthropic, Google, and open-source alternatives.</p>
      
      <h3>Key Features</h3>
      <ul>
        <li><strong>Unified API</strong> - One endpoint for all models</li>
        <li><strong>Automatic fallbacks</strong> - Switch to backup models if your primary choice is unavailable</li>
        <li><strong>Cost optimization</strong> - Pick the best model for your price point</li>
      </ul>
      
      <p>Select a topic from the sidebar to learn more about specific features and implementations.</p>
    `;
  }
  
  const section = pathSegments[0];
  const subSection = pathSegments[1] || "";
  
  switch (section) {
    case "api":
      return generateApiDocs(subSection);
    case "models":
      return generateModelDocs(subSection);
    case "guides":
      return generateGuideDocs(subSection);
    case "sdk":
      return generateSdkDocs(subSection);
    default:
      return `<h1>Page Not Found</h1><p>The requested documentation page was not found.</p>`;
  }
}

function generateApiDocs(subSection: string): string {
  switch (subSection) {
    case "authentication":
      return `
        <h1>Authentication</h1>
        <p>To authenticate with the OpenRouter API, you need an API key. API keys are passed via the <code>Authorization</code> header.</p>
        
        <h2>Getting an API Key</h2>
        <p>You can obtain an API key from your account dashboard after signing up. Free trial credits are available for new users.</p>
        
        <h2>Using Your API Key</h2>
        <pre><code>
        curl https://api.openrouter.ai/v1/chat/completions \\
          -H "Authorization: Bearer $YOUR_API_KEY" \\
          -H "Content-Type: application/json" \\
          -d '{
              "model": "anthropic/claude-3-opus",
              "messages": [{"role": "user", "content": "Hello"}]
            }'
        </code></pre>
        
        <h2>API Key Security</h2>
        <p>Keep your API key secure and never expose it in client-side code. If you believe your key has been compromised, you can regenerate it from your dashboard.</p>
      `;
    case "chat-completion":
      return `
        <h1>Chat Completion API</h1>
        <p>The chat completion API allows you to generate responses from LLMs in a conversational format.</p>
        
        <h2>Endpoint</h2>
        <pre><code>POST https://api.openrouter.ai/v1/chat/completions</code></pre>
        
        <h2>Request Parameters</h2>
        <ul>
          <li><code>model</code> (string, required): The model identifier</li>
          <li><code>messages</code> (array, required): Array of message objects</li>
          <li><code>temperature</code> (number, optional): Controls randomness (0-1)</li>
          <li><code>max_tokens</code> (integer, optional): Maximum number of tokens to generate</li>
          <li><code>stream</code> (boolean, optional): Whether to stream the response</li>
        </ul>
        
        <h2>Example Request</h2>
        <pre><code>
        {
          "model": "anthropic/claude-3-opus",
          "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "What is OpenRouter?"}
          ],
          "temperature": 0.7,
          "max_tokens": 500
        }
        </code></pre>
        
        <h2>Response Format</h2>
        <pre><code>
        {
          "id": "chatcmpl-abc123",
          "object": "chat.completion",
          "created": 1677858242,
          "model": "anthropic/claude-3-opus",
          "choices": [
            {
              "message": {
                "role": "assistant",
                "content": "OpenRouter is a unified API that provides access to various LLMs..."
              },
              "finish_reason": "stop",
              "index": 0
            }
          ],
          "usage": {
            "prompt_tokens": 25,
            "completion_tokens": 42,
            "total_tokens": 67
          }
        }
        </code></pre>
      `;
    // Add more API section content here
    default:
      if (!subSection) {
        return `
          <h1>API Reference</h1>
          <p>The OpenRouter API is designed to be compatible with OpenAI's API format while providing access to a wider range of models.</p>
          
          <h2>API Endpoints</h2>
          <ul>
            <li><a href="/docs/api/authentication">Authentication</a> - How to authenticate with the API</li>
            <li><a href="/docs/api/chat-completion">Chat Completion</a> - Generate conversational responses</li>
            <li><a href="/docs/api/models">Models</a> - List and select available models</li>
            <li><a href="/docs/api/errors">Error Handling</a> - How to handle API errors</li>
          </ul>
          
          <h2>Base URL</h2>
          <pre><code>https://api.openrouter.ai/v1</code></pre>
        `;
      }
      return `<h1>Documentation Not Available</h1><p>The requested API documentation section is not available.</p>`;
  }
}

function generateModelDocs(provider: string): string {
  switch (provider) {
    case "openai":
      return `
        <h1>OpenAI Models</h1>
        <p>OpenRouter provides access to OpenAI's models through our unified API.</p>
        
        <h2>Available Models</h2>
        <ul>
          <li><code>openai/gpt-4o</code> - The latest multimodal model from OpenAI</li>
          <li><code>openai/gpt-4-turbo</code> - Advanced model with 128k context</li>
          <li><code>openai/gpt-3.5-turbo</code> - Fast and cost-effective model</li>
        </ul>
        
        <h2>Usage Example</h2>
        <pre><code>
        {
          "model": "openai/gpt-4o",
          "messages": [
            {"role": "user", "content": "Explain quantum computing in simple terms"}
          ]
        }
        </code></pre>
      `;
    // Add more model providers here
    default:
      if (!provider) {
        return `
          <h1>Models</h1>
          <p>OpenRouter provides access to a wide range of language models from different providers.</p>
          
          <h2>Supported Providers</h2>
          <ul>
            <li><a href="/docs/models/openai">OpenAI</a> - GPT-4o, GPT-4-turbo, and GPT-3.5-turbo</li>
            <li><a href="/docs/models/anthropic">Anthropic</a> - Claude 3 Opus, Claude 3 Sonnet, and Claude 3 Haiku</li>
            <li><a href="/docs/models/google">Google</a> - Gemini 1.5 Pro and Gemini 1.5 Flash</li>
            <li><a href="/docs/models/open-source">Open Source</a> - Llama 3 and other open models</li>
          </ul>
          
          <h2>Model Selection</h2>
          <p>When making API requests, specify the desired model using the format <code>provider/model-name</code>.</p>
        `;
      }
      return `<h1>Documentation Not Available</h1><p>The requested model documentation is not available.</p>`;
  }
}

function generateGuideDocs(topic: string): string {
  // Add guides content here
  return `<h1>Guide: ${topic || 'Guides'}</h1><p>Guide content will be available soon.</p>`;
}

function generateSdkDocs(language: string): string {
  // Add SDK documentation here
  return `<h1>SDK: ${language || 'Libraries'}</h1><p>SDK documentation will be available soon.</p>`;
}
