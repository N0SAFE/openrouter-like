import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";

// Mock model data, will be replaced with real data
const getModelInfo = (modelId: string) => {
  return {
    name: modelId.split('/').pop()?.replace(/-/g, ' ').replace(/(\d+)([A-Za-z])/g, '$1 $2') || 'AI Assistant',
    avatarFallback: modelId.split('/')[0]?.charAt(0).toUpperCase() || 'AI',
  };
};

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
};

type ChatInterfaceProps = {
  modelId: string;
};

export function ChatInterface({ modelId }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelInfo = getModelInfo(modelId);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (input.trim() === "") return;
    
    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Mock AI response - in real app this would call the OpenRouter API
      setTimeout(() => {
        const aiMessage: Message = {
          role: "assistant",
          content: `This is a mock response from ${modelInfo.name}. In the real application, this would come from the actual AI model through OpenRouter's API.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Error generating response:", error);
      setIsLoading(false);
    }
  };

  // Handle text area resizing
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Messages display */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <h3 className="text-lg font-medium">Start a conversation with {modelInfo.name}</h3>
              <p>Your messages will appear here</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index}
              className={`flex gap-3 mb-6 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{modelInfo.avatarFallback}</AvatarFallback>
                </Avatar>
              )}
              <Card className={`p-3 max-w-[80%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </Card>
              {message.role === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border/40 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${modelInfo.name}...`}
            className="min-h-[60px] resize-none flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || input.trim() === ""}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <div className="mt-2 text-xs text-muted-foreground">
          <span>Using {modelInfo.name} via OpenRouter Clone</span>
        </div>
      </div>
    </div>
  );
}
