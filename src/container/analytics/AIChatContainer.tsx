import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/redux';
import { useLLMService } from '@/hooks/useLLMService';
import AIChatView from '@/view/analytics-hub/ai/AIChatView';
import type { AIChatMessage, AIChatViewProps } from '@/types/domains/analytics/ai';
import AIContextService from '@service/domain/ai/contextService';
import Logger from '@service/shared/logging/Logger/logger';

interface AIChatContainerProps {
  onBack: () => void;
}

/**
 * AI Chat Container
 * Manages AI chat state and business logic
 */
export const AIChatContainer: React.FC<AIChatContainerProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { sendMessage: sendLLMMessage, modelStatus } = useLLMService();
  
  // Redux state - Complete financial data
  const { items: assets, portfolioCache } = useAppSelector(state => state.transactions);
  const { items: income } = useAppSelector(state => state.income);
  const { items: expenses } = useAppSelector(state => state.expenses);
  const { items: liabilities } = useAppSelector(state => state.liabilities);
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);
  const { assetFocusData, financialSummary } = useAppSelector(state => state.calculatedData);

  // Local state
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // State to toggle between financial overview and all assets
  const [viewMode, setViewMode] = useState<'financialOverview' | 'allAssets'>('financialOverview');

  // Calculate current financial metrics for context
  const financialSnapshot = {
    totalAssets: portfolioCache?.totals?.totalValue || 0,
    monthlyIncome: portfolioCache?.totals?.monthlyIncome || 0,
    totalExpenses: expenses.reduce((sum: number, exp: any) => sum + (exp.paymentSchedule?.amount || 0), 0),
    netWorth: (portfolioCache?.totals?.totalValue || 0) - liabilities.reduce((sum: number, lib: any) => sum + (lib.currentBalance || 0), 0)
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0 && modelStatus === 'loaded') {
      const welcomeMessage: AIChatMessage = {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: t('ai.chat.welcome'),
        timestamp: new Date(),
        dataSnapshot: financialSnapshot
      };
      setMessages([welcomeMessage]);
    }
  }, [modelStatus, messages.length, financialSnapshot, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping || modelStatus !== 'loaded') return;

    const userMessage: AIChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      dataSnapshot: financialSnapshot
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      Logger.info('AIChatContainer: Sending message to AI model');

      // Construct contextual message based on view mode using AI Context Service
      const financialData = {
        income,
        expenses,
        liabilities,
        assetFocusData: {
          ...assetFocusData,
          assetDefinitions // Add assetDefinitions from Redux to the data structure
        },
        financialSummary
      };

      const contextualMessage = viewMode === 'financialOverview'
        ? AIContextService.createFinancialOverviewContext(userMessage.content, financialSnapshot, financialData)
        : AIContextService.createAllAssetsContext(userMessage.content, financialData.assetFocusData);

      const response = await sendLLMMessage(contextualMessage);

      const assistantMessage: AIChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: response?.content || t('ai.chat.error.no_response'),
        timestamp: new Date(),
        dataSnapshot: financialSnapshot
      };

      setMessages(prev => [...prev, assistantMessage]);
      Logger.info('AIChatContainer: AI response received successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('ai.chat.error.message_failed');
      Logger.error(`AIChatContainer: Error sending message: ${errorMessage}`);

      setError(errorMessage);

      const errorChatMessage: AIChatMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: t('ai.chat.error.sorry'),
        timestamp: new Date(),
        dataSnapshot: financialSnapshot
      };

      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    Logger.info('AIChatContainer: Clearing chat history');
    setMessages([]);
    setError(null);
  };

  const handleSuggestedQuestionClick = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const suggestedQuestions = [
    t('ai.chat.suggestions.portfolio_analysis'),
    t('ai.chat.suggestions.savings_advice'),
    t('ai.chat.suggestions.risk_assessment'),
    t('ai.chat.suggestions.investment_strategy')
  ];

  // Props for the view component - using the updated AIChatViewProps with viewMode
  const viewProps: AIChatViewProps = {
    onBack,
    modelStatus,
    messages,
    inputValue,
    isTyping,
    error,
    financialSnapshot,
    assets,
    suggestedQuestions,
    messagesEndRef,
    inputRef,
    onInputChange: setInputValue,
    onSendMessage: handleSendMessage,
    onKeyPress: handleKeyPress,
    onClearChat: clearChat,
    onSuggestedQuestionClick: handleSuggestedQuestionClick,
    formatTimestamp,
    viewMode,
    setViewMode // Pass the state setter to the view
  };

  return <AIChatView {...viewProps} />;
};

export default AIChatContainer;
