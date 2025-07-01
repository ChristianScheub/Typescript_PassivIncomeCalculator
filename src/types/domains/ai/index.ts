import type { RootState } from '@/store';

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
  generatePortfolioAdvice(portfolioData: any): Promise<FinancialInsightResponse>;
  
  /**
   * Generate budget recommendations
   */
  generateBudgetRecommendations(financialData: any): Promise<FinancialInsightResponse>;
  
  /**
   * Generate forecast insights
   */
  generateForecastInsights(forecastData: any): Promise<FinancialInsightResponse>;
}

/**
 * Redux State Serialization Types
 */
export interface SerializedReduxState {
  transactions: any;
  assetCategories: any;
  liabilities: any;
  expenses: any;
  income: any;
  customAnalytics: any;
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
