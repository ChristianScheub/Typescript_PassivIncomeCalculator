import type { RootState } from '@/store';
import type { PortfolioPosition } from '@/types/domains/portfolio/position';
import type { Income, Expense, Liability } from '@/types/domains/financial/entities';
import type { AssetCategory } from '@/types/domains/assets/categories';

/**
 * LLM Service Types
 */
export interface LLMMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface LLMModelConfig {
  modelPath: string;
  modelName: string;
  description?: string;
  version?: string;
  capabilities?: string[];
  maxTokens?: number;
  temperature?: number;
  parameters?: {
    maxTokens?: number;
    temperature?: number;
    topK?: number;
    topP?: number;
  };
  metadata?: {
    author?: string;
    trainingData?: string;
    modelSize?: string;
    supportedLanguages?: string[];
    lastUpdated?: string;
    note?: string;
  };
}

export interface LLMResponse {
  content: string;
  confidence?: number;
  processingTime: number;
  recommendations?: Array<{
    type: string;
    title: string;
    description: string;
    priority: string;
    impact: string;
  }>;
}

export interface LLMService {
  /**
   * Initialize and load the WebLLM model
   */
  loadModel(config: LLMModelConfig): Promise<void>;
  
  /**
   * Check if model is loaded and ready
   */
  isModelLoaded(): boolean;
  
  /**
   * Send a message to the LLM and get response
   */
  sendMessage(message: string): Promise<LLMResponse>;
  
  /**
   * Get model information
   */
  getModelInfo(): LLMModelConfig | null;
  
  /**
   * Cleanup model resources
   */
  dispose(): Promise<void>;
}

/**
 * Financial Insights Service Types
 */
export interface FinancialInsightRequest {
  reduxState: RootState;
  requestType: 'general' | 'portfolio' | 'budget' | 'forecast' | 'custom';
  customPrompt?: string;
}

export interface FinancialInsightResponse {
  insight: string;
  recommendations: string[];
  confidence: number;
  dataUsed: string[];
  generatedAt: Date;
}

export interface FinancialInsightsService {
  /**
   * Generate financial insights from complete Redux state
   */
  generateInsightsFromReduxState(request: FinancialInsightRequest): Promise<FinancialInsightResponse>;
  
  /**
   * Generate portfolio-specific advice
   */
  generatePortfolioAdvice(portfolioData: { positions: PortfolioPosition[]; [key: string]: unknown }): Promise<FinancialInsightResponse>;
  
  /**
   * Generate budget recommendations
   */
  generateBudgetRecommendations(financialData: { income: Income[]; expenses: Expense[]; liabilities: Liability[]; [key: string]: unknown }): Promise<FinancialInsightResponse>;
  
  /**
   * Generate forecast insights
   */
  generateForecastInsights(forecastData: Record<string, unknown>): Promise<FinancialInsightResponse>;
}

/**
 * Redux State Serialization Types
 */
export interface SerializedReduxState {
  transactions: Record<string, unknown>;
  assetCategories: AssetCategory[];
  liabilities: Liability[];
  expenses: Expense[];
  income: Income[];
  customAnalytics: Record<string, unknown>;
  forecast: any;
  apiConfig: any;
  calculatedData: any;
  timestamp: string;
}

/**
 * Model Status Types
 */
export type ModelStatus = 'unloaded' | 'loading' | 'loaded' | 'error';

export interface ModelState {
  status: ModelStatus;
  config: LLMModelConfig | null;
  error: string | null;
  loadedAt: Date | null;
}
