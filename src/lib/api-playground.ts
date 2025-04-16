import { z } from 'zod';
import { ModelRequest } from './models';

// Define playground request history item
export interface PlaygroundHistoryItem {
  id: string;
  userId: string;
  request: ModelRequest;
  response: any;
  executionTimeMs: number;
  timestamp: Date;
  name?: string;
  tags?: string[];
  notes?: string;
  favorite: boolean;
  responseTokens: number;
  promptTokens: number;
  totalTokens: number;
}

// Define shared request template
export interface RequestTemplate {
  id: string;
  name: string;
  description?: string;
  request: ModelRequest;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags?: string[];
  favoriteCount: number;
  usageCount: number;
}

// Define playground user settings
export interface PlaygroundSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  editorSettings: {
    fontSize: number;
    tabSize: number;
    lineWrapping: boolean;
    autoCompletionEnabled: boolean;
  };
  defaultModel: string;
  defaultParameters: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
  layout: 'side-by-side' | 'top-bottom';
  showTokenCount: boolean;
  showLatency: boolean;
  showCost: boolean;
  autoSaveHistory: boolean;
  historyLimit: number;
}

// Schema for updating playground settings
export const PlaygroundSettingsUpdateSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  editorSettings: z.object({
    fontSize: z.number().min(8).max(24).optional(),
    tabSize: z.number().min(2).max(8).optional(),
    lineWrapping: z.boolean().optional(),
    autoCompletionEnabled: z.boolean().optional(),
  }).optional(),
  defaultModel: z.string().optional(),
  defaultParameters: z.object({
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().positive().int().optional(),
    topP: z.number().min(0).max(1).optional(),
    frequencyPenalty: z.number().min(-2).max(2).optional(),
    presencePenalty: z.number().min(-2).max(2).optional(),
  }).optional(),
  layout: z.enum(['side-by-side', 'top-bottom']).optional(),
  showTokenCount: z.boolean().optional(),
  showLatency: z.boolean().optional(),
  showCost: z.boolean().optional(),
  autoSaveHistory: z.boolean().optional(),
  historyLimit: z.number().int().min(10).max(1000).optional(),
});

export type PlaygroundSettingsUpdate = z.infer<typeof PlaygroundSettingsUpdateSchema>;

// Define schema for creating/updating templates
export const RequestTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  request: z.any(), // This would be ModelRequestSchema in a full implementation
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

export type RequestTemplateInput = z.infer<typeof RequestTemplateSchema>;

// Define filter/search schema for history and templates
export const PlaygroundSearchSchema = z.object({
  query: z.string().optional(),
  tags: z.array(z.string()).optional(),
  modelId: z.string().optional(),
  dateFrom: z.string().optional(), // ISO date string
  dateTo: z.string().optional(), // ISO date string
  favoritesOnly: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

export type PlaygroundSearch = z.infer<typeof PlaygroundSearchSchema>;

export class APIPlayground {
  private static instance: APIPlayground;
  private history: Map<string, PlaygroundHistoryItem> = new Map();
  private templates: Map<string, RequestTemplate> = new Map();
  private settings: Map<string, PlaygroundSettings> = new Map();
  
  private constructor() {}
  
  public static getInstance(): APIPlayground {
    if (!APIPlayground.instance) {
      APIPlayground.instance = new APIPlayground();
    }
    return APIPlayground.instance;
  }

  /**
   * Save a request and response to history
   */
  public saveToHistory(
    userId: string,
    request: ModelRequest,
    response: any,
    executionTimeMs: number,
    options?: {
      name?: string;
      tags?: string[];
      notes?: string;
      favorite?: boolean;
      responseTokens?: number;
      promptTokens?: number;
    }
  ): PlaygroundHistoryItem {
    // Check if user has playground settings
    const userSettings = this.getOrCreateUserSettings(userId);
    
    // Only save to history if setting is enabled
    if (!userSettings.autoSaveHistory) {
      // Create a history item but don't save it
      return {
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        request,
        response,
        executionTimeMs,
        timestamp: new Date(),
        name: options?.name,
        tags: options?.tags,
        notes: options?.notes,
        favorite: options?.favorite || false,
        responseTokens: options?.responseTokens || this.estimateTokens(JSON.stringify(response)),
        promptTokens: options?.promptTokens || this.estimateTokens(JSON.stringify(request)),
        totalTokens: (options?.responseTokens || this.estimateTokens(JSON.stringify(response))) +
                    (options?.promptTokens || this.estimateTokens(JSON.stringify(request)))
      };
    }
    
    const historyItem: PlaygroundHistoryItem = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      request,
      response,
      executionTimeMs,
      timestamp: new Date(),
      name: options?.name,
      tags: options?.tags,
      notes: options?.notes,
      favorite: options?.favorite || false,
      responseTokens: options?.responseTokens || this.estimateTokens(JSON.stringify(response)),
      promptTokens: options?.promptTokens || this.estimateTokens(JSON.stringify(request)),
      totalTokens: (options?.responseTokens || this.estimateTokens(JSON.stringify(response))) +
                  (options?.promptTokens || this.estimateTokens(JSON.stringify(request)))
    };
    
    this.history.set(historyItem.id, historyItem);
    
    // Enforce history limit
    this.enforceHistoryLimit(userId, userSettings.historyLimit);
    
    return historyItem;
  }

  /**
   * Get a history item by ID
   */
  public getHistoryItem(id: string, userId: string): PlaygroundHistoryItem | undefined {
    const item = this.history.get(id);
    return item && item.userId === userId ? item : undefined;
  }

  /**
   * Update a history item
   */
  public updateHistoryItem(
    id: string,
    userId: string,
    updates: {
      name?: string;
      tags?: string[];
      notes?: string;
      favorite?: boolean;
    }
  ): PlaygroundHistoryItem | null {
    const item = this.history.get(id);
    
    if (!item || item.userId !== userId) {
      return null;
    }
    
    const updatedItem: PlaygroundHistoryItem = {
      ...item,
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.tags !== undefined && { tags: updates.tags }),
      ...(updates.notes !== undefined && { notes: updates.notes }),
      ...(updates.favorite !== undefined && { favorite: updates.favorite }),
    };
    
    this.history.set(id, updatedItem);
    return updatedItem;
  }

  /**
   * Delete a history item
   */
  public deleteHistoryItem(id: string, userId: string): boolean {
    const item = this.history.get(id);
    
    if (!item || item.userId !== userId) {
      return false;
    }
    
    return this.history.delete(id);
  }

  /**
   * Search history items
   */
  public searchHistory(
    userId: string,
    search: PlaygroundSearch
  ): { items: PlaygroundHistoryItem[]; total: number } {
    let items = Array.from(this.history.values())
      .filter(item => item.userId === userId);
    
    // Apply search filters
    if (search.query) {
      const query = search.query.toLowerCase();
      items = items.filter(item => 
        item.name?.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query) ||
        JSON.stringify(item.request).toLowerCase().includes(query) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    if (search.tags && search.tags.length > 0) {
      items = items.filter(item => 
        item.tags && search.tags!.every(tag => item.tags.includes(tag))
      );
    }
    
    if (search.modelId) {
      items = items.filter(item => 
        item.request.model === search.modelId
      );
    }
    
    if (search.dateFrom) {
      const fromDate = new Date(search.dateFrom);
      items = items.filter(item => item.timestamp >= fromDate);
    }
    
    if (search.dateTo) {
      const toDate = new Date(search.dateTo);
      items = items.filter(item => item.timestamp <= toDate);
    }
    
    if (search.favoritesOnly) {
      items = items.filter(item => item.favorite);
    }
    
    // Sort by timestamp, newest first
    items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Get total count before pagination
    const total = items.length;
    
    // Apply pagination
    const limit = search.limit || 20;
    const offset = search.offset || 0;
    items = items.slice(offset, offset + limit);
    
    return {
      items,
      total,
    };
  }

  /**
   * Create a request template
   */
  public createTemplate(
    input: RequestTemplateInput,
    userId: string
  ): RequestTemplate {
    const id = `tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const template: RequestTemplate = {
      id,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      favoriteCount: 0,
      usageCount: 0,
      ...input,
    };
    
    this.templates.set(id, template);
    return template;
  }

  /**
   * Get a template by ID
   */
  public getTemplate(id: string): RequestTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Update a template
   */
  public updateTemplate(
    id: string,
    input: Partial<RequestTemplateInput>,
    userId: string
  ): RequestTemplate | null {
    const template = this.templates.get(id);
    
    if (!template || (template.createdBy !== userId && !template.isPublic)) {
      return null;
    }
    
    // Only the creator can modify the template
    if (template.createdBy !== userId) {
      return null;
    }
    
    const updatedTemplate: RequestTemplate = {
      ...template,
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.request !== undefined && { request: input.request }),
      ...(input.tags !== undefined && { tags: input.tags }),
      ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
      updatedAt: new Date(),
    };
    
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  /**
   * Delete a template
   */
  public deleteTemplate(id: string, userId: string): boolean {
    const template = this.templates.get(id);
    
    if (!template || template.createdBy !== userId) {
      return false;
    }
    
    return this.templates.delete(id);
  }

  /**
   * Search templates
   */
  public searchTemplates(
    userId: string,
    search: PlaygroundSearch
  ): { items: RequestTemplate[]; total: number } {
    // Get all templates that are either created by the user or public
    let items = Array.from(this.templates.values())
      .filter(template => template.createdBy === userId || template.isPublic);
    
    // Apply search filters
    if (search.query) {
      const query = search.query.toLowerCase();
      items = items.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query) ||
        JSON.stringify(template.request).toLowerCase().includes(query) ||
        (template.tags && template.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    if (search.tags && search.tags.length > 0) {
      items = items.filter(template => 
        template.tags && search.tags!.every(tag => template.tags.includes(tag))
      );
    }
    
    if (search.modelId) {
      items = items.filter(template => 
        template.request.model === search.modelId
      );
    }
    
    // Sort by usage count, most used first
    items.sort((a, b) => b.usageCount - a.usageCount);
    
    // Get total count before pagination
    const total = items.length;
    
    // Apply pagination
    const limit = search.limit || 20;
    const offset = search.offset || 0;
    items = items.slice(offset, offset + limit);
    
    return {
      items,
      total,
    };
  }

  /**
   * Get playground settings for a user
   */
  public getUserSettings(userId: string): PlaygroundSettings | undefined {
    return this.settings.get(userId);
  }

  /**
   * Initialize or get playground settings for a user
   */
  public getOrCreateUserSettings(userId: string): PlaygroundSettings {
    let userSettings = this.settings.get(userId);
    
    if (!userSettings) {
      // Create default settings
      userSettings = {
        userId,
        theme: 'system',
        editorSettings: {
          fontSize: 14,
          tabSize: 2,
          lineWrapping: true,
          autoCompletionEnabled: true,
        },
        defaultModel: 'anthropic/claude-3-sonnet',
        defaultParameters: {
          temperature: 0.7,
          maxTokens: 1000,
        },
        layout: 'side-by-side',
        showTokenCount: true,
        showLatency: true,
        showCost: true,
        autoSaveHistory: true,
        historyLimit: 100,
      };
      
      this.settings.set(userId, userSettings);
    }
    
    return userSettings;
  }

  /**
   * Update playground settings
   */
  public updateUserSettings(
    userId: string,
    updates: PlaygroundSettingsUpdate
  ): PlaygroundSettings {
    const currentSettings = this.getOrCreateUserSettings(userId);
    
    const updatedSettings: PlaygroundSettings = {
      ...currentSettings,
      ...(updates.theme !== undefined && { theme: updates.theme }),
      ...(updates.editorSettings && { 
        editorSettings: {
          ...currentSettings.editorSettings,
          ...updates.editorSettings,
        } 
      }),
      ...(updates.defaultModel !== undefined && { defaultModel: updates.defaultModel }),
      ...(updates.defaultParameters && { 
        defaultParameters: {
          ...currentSettings.defaultParameters,
          ...updates.defaultParameters,
        } 
      }),
      ...(updates.layout !== undefined && { layout: updates.layout }),
      ...(updates.showTokenCount !== undefined && { showTokenCount: updates.showTokenCount }),
      ...(updates.showLatency !== undefined && { showLatency: updates.showLatency }),
      ...(updates.showCost !== undefined && { showCost: updates.showCost }),
      ...(updates.autoSaveHistory !== undefined && { autoSaveHistory: updates.autoSaveHistory }),
      ...(updates.historyLimit !== undefined && { historyLimit: updates.historyLimit }),
    };
    
    this.settings.set(userId, updatedSettings);
    return updatedSettings;
  }

  /**
   * Record template usage
   */
  public recordTemplateUsage(id: string): void {
    const template = this.templates.get(id);
    
    if (template) {
      template.usageCount++;
      this.templates.set(id, template);
    }
  }

  /**
   * Enforce history limit for a user
   */
  private enforceHistoryLimit(userId: string, limit: number): void {
    // Get all history items for this user
    const userItems = Array.from(this.history.values())
      .filter(item => item.userId === userId);
    
    // If we're under the limit, no need to do anything
    if (userItems.length <= limit) {
      return;
    }
    
    // Sort by timestamp, oldest first
    userItems.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Protect favorites from deletion
    const nonFavorites = userItems.filter(item => !item.favorite);
    const favorites = userItems.filter(item => item.favorite);
    
    // If we have enough non-favorites to delete, only delete those
    const toDelete = userItems.length - limit;
    
    if (nonFavorites.length >= toDelete) {
      // Delete oldest non-favorites
      nonFavorites.slice(0, toDelete).forEach(item => {
        this.history.delete(item.id);
      });
    } else {
      // Delete all non-favorites
      nonFavorites.forEach(item => {
        this.history.delete(item.id);
      });
      
      // Delete oldest favorites to meet limit
      const favoritesToDelete = toDelete - nonFavorites.length;
      favorites.slice(0, favoritesToDelete).forEach(item => {
        this.history.delete(item.id);
      });
    }
  }
  
  /**
   * Estimate token count from text (very rough approximation)
   */
  private estimateTokens(text: string): number {
    // Very simple approximation: ~4 chars per token on average
    return Math.ceil(text.length / 4);
  }
}

export default APIPlayground.getInstance();
