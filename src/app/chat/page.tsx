"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { ModelSidebar } from "@/components/models/ModelSidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";

type ChatTab = {
  id: string;
  modelId: string;
  name: string;
  hasSelectedModel: boolean;
};

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState("anthropic/claude-3-opus");
  const [tabs, setTabs] = useState<ChatTab[]>([
    { id: "tab-1", modelId: "anthropic/claude-3-opus", name: "Claude 3 Opus", hasSelectedModel: true }
  ]);
  const [activeTab, setActiveTab] = useState("tab-1");
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'w') {
        event.preventDefault();
        if (activeTab) {
          closeTab(activeTab, new MouseEvent('click'));
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, tabs]);

  const handleSelectModel = (modelId: string) => {
    const modelName = modelId.split('/').pop()?.replace(/-/g, ' ').replace(/(\d+)([A-Za-z])/g, '$1 $2') || 'AI Assistant';
    
    // Check if there's already a tab with this model
    const existingTab = tabs.find(tab => tab.modelId === modelId);
    
    if (existingTab) {
      // Switch to existing tab
      setActiveTab(existingTab.id);
    } else {
      // Create a new tab
      const newTabId = `tab-${Date.now()}`;
      const newTab: ChatTab = {
        id: newTabId,
        modelId: modelId,
        name: modelName,
        hasSelectedModel: true
      };
      
      setTabs([...tabs, newTab]);
      setActiveTab(newTabId);
    }
    
    setSelectedModel(modelId);
  };

  const closeTab = (tabId: string, event: React.MouseEvent | null) => {
    if (event) {
      event.stopPropagation();
    }
    
    // Don't close if it's the last tab
    if (tabs.length <= 1) return;
    
    const updatedTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(updatedTabs);
    
    // If we're closing the active tab, switch to the first available tab
    if (activeTab === tabId) {
      setActiveTab(updatedTabs[0].id);
      setSelectedModel(updatedTabs[0].modelId);
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'w') {
        event.preventDefault();
        closeTab(activeTab, null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, tabs]);
  
  const createNewTab = () => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: ChatTab = {
      id: newTabId,
      modelId: "",
      name: "New Chat",
      hasSelectedModel: false
    };
    
    setTabs([...tabs, newTab]);
    setActiveTab(newTabId);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <ModelSidebar selectedModel={selectedModel} onSelectModel={handleSelectModel} />
        <main className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b flex items-center">
              <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
              <TabsList className="px-2 h-12 flex-1 overflow-x-auto scrollbar-hide flex justify-start">
                {tabs.map(tab => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex items-center gap-2 px-4 relative w-40 min-w-[10rem] max-w-[10rem]"
                  >
                    <span className="truncate flex-1 text-left">{tab.name}</span>
                    <button
                      onClick={(e) => closeTab(tab.id, e)}
                      className="ml-1 rounded-full hover:bg-muted p-1 flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </TabsTrigger>
                ))}
              </TabsList>
              <button 
                onClick={createNewTab}
                className="flex items-center justify-center p-2 h-8 w-8 rounded-full mr-2 hover:bg-muted"
                title="New chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </button>
            </div>
            
            {tabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="flex-1 overflow-hidden m-0 border-0 p-0">
                {tab.hasSelectedModel ? (
                  <ChatInterface modelId={tab.modelId} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6">
                    <div className="max-w-md text-center mb-8">
                      <h2 className="text-2xl font-bold mb-2">Select a model to start chatting</h2>
                      <p className="text-muted-foreground">Choose an AI model from the sidebar to begin a new conversation.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
                      {[
                        "anthropic/claude-3-opus",
                        "openai/gpt-4o",
                        "google/gemini-1.5-pro",
                        "anthropic/claude-3-sonnet",
                        "meta-llama/llama-3-70b-instruct",
                        "openai/gpt-3.5-turbo"
                      ].map(modelId => {
                        const name = modelId.split('/').pop()?.replace(/-/g, ' ').replace(/(\d+)([A-Za-z])/g, '$1 $2') || 'AI Model';
                        return (
                          <button 
                            key={modelId}
                            onClick={() => {
                              const updatedTabs = tabs.map(t => 
                                t.id === activeTab 
                                  ? { ...t, modelId, name, hasSelectedModel: true }
                                  : t
                              );
                              setTabs(updatedTabs);
                              setSelectedModel(modelId);
                            }}
                            className="p-4 border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors text-left"
                          >
                            <div className="font-medium">{name}</div>
                            <div className="text-xs text-muted-foreground">{modelId.split('/')[0]}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>
    </div>
  );
}
