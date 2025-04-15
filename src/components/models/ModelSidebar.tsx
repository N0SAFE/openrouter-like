import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock models data - will be fetched from API later
const mockModels = [
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    context: "200k",
    type: "chat",
    tags: ["premium"]
  },
  {
    id: "anthropic/claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    context: "200k",
    type: "chat",
    tags: []
  },
  {
    id: "google/gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    context: "1m",
    type: "chat",
    tags: []
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    context: "128k",
    type: "chat",
    tags: []
  },
  {
    id: "meta-llama/llama-3-70b-instruct",
    name: "Llama 3 70B",
    provider: "Meta",
    context: "8k",
    type: "chat",
    tags: ["open"]
  }
];

type ModelProps = {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
};

export function ModelSidebar({ selectedModel, onSelectModel }: ModelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter models based on search query
  const filteredModels = mockModels.filter(model => 
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="w-72 h-full border-r border-border/40 bg-muted/40 flex flex-col">
      <div className="p-4 border-b border-border/40">
        <h2 className="text-lg font-semibold mb-4">Models</h2>
        <Input
          placeholder="Search models..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex-1 overflow-auto p-2">
        {filteredModels.map((model) => (
          <Card 
            key={model.id}
            className={`mb-2 cursor-pointer hover:border-primary transition-all ${selectedModel === model.id ? 'border-primary bg-muted' : ''}`}
            onClick={() => onSelectModel(model.id)}
          >
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {model.name}
                {model.tags.includes("premium") && (
                  <Badge variant="secondary" className="ml-2">Premium</Badge>
                )}
                {model.tags.includes("open") && (
                  <Badge variant="outline" className="ml-2">Open</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">{model.provider}</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
              Context: {model.context}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
