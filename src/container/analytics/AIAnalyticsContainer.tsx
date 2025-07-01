import React, { useState } from 'react';
import AIInsightsContainer from '@/container/analytics/AIInsightsContainer';
import AIChatContainer from '@/container/analytics/AIChatContainer';
import type { AIAnalyticsCategory } from '@/types/domains/analytics/ai';

interface AIAnalyticsContainerProps {
  category: AIAnalyticsCategory;
  onBack: () => void;
}

/**
 * AI Analytics Container
 * Manages navigation between AI Insights and AI Chat containers
 */
const AIAnalyticsContainer: React.FC<AIAnalyticsContainerProps> = ({ 
  category, 
  onBack 
}) => {
  const [currentView] = useState<AIAnalyticsCategory>(category);

  switch (currentView) {
    case 'insights':
      return <AIInsightsContainer onBack={onBack} />;
    case 'chat':
      return <AIChatContainer onBack={onBack} />;
    default:
      return <AIInsightsContainer onBack={onBack} />;
  }
};

export default AIAnalyticsContainer;
