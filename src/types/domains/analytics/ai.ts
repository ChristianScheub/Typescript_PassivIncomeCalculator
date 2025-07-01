import type { 
  FinancialInsightRequest, 
  FinancialInsightResponse 
} from '@/types/domains/ai';

/**
 * AI Analytics Types for Analytics Hub Integration
 */

export type AIAnalyticsCategory = 'insights' | 'chat';

export interface AIInsightsViewState {
  isGenerating: boolean;
  insights: FinancialInsightResponse | null;
  error: string | null;
  lastGenerated: Date | null;
  requestType: FinancialInsightRequest['requestType'];
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  dataSnapshot?: {
    totalAssets: number;
    monthlyIncome: number;
    totalExpenses: number;
    netWorth: number;
  };
}

export interface AIChatViewState {
  messages: AIChatMessage[];
  isTyping: boolean;
  error: string | null;
  inputValue: string;
}

export interface AIAnalyticsProps {
  category: AIAnalyticsCategory;
  onBack: () => void;
}

export interface AIChatViewProps {
  onBack: () => void;
  modelStatus: any;
  messages: AIChatMessage[];
  inputValue: string;
  isTyping: boolean;
  error: string | null;
  financialSnapshot: {
    totalAssets: number;
    monthlyIncome: number;
    totalExpenses: number;
    netWorth: number;
  };
  assets: any[];
  suggestedQuestions: string[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onClearChat: () => void;
  onSuggestedQuestionClick: (question: string) => void;
  formatTimestamp: (timestamp: Date) => string;
  viewMode: 'financialOverview' | 'allAssets';
  setViewMode: React.Dispatch<React.SetStateAction<'financialOverview' | 'allAssets'>>;
}

export interface AIInsightsCardProps {
  onClick: () => void;
  className?: string;
}

export interface AIChatCardProps {
  onClick: () => void;
  className?: string;
}

export interface AIInsightsViewProps {
  onBack: () => void;
  modelStatus: any;
  isGenerating: boolean;
  insights: any;
  error: string | null;
  lastGenerated: Date | null;
  financialMetrics: {
    totalAssets: number;
    monthlyIncome: number;
    totalExpenses: number;
    totalLiabilities: number;
    assetsCount: number;
    incomeSourcesCount: number;
    expenseCategories: number;
  };
  netWorth: number;
  savingsRate: number;
  onGenerateInsights: () => void;
}
