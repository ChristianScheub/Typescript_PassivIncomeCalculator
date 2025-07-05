import React from 'react';
import { MessageCircle, Bot, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/shared/Card';
import type { AIChatCardProps } from '@/types/domains/analytics/ai';

/**
 * AI Chat Card Component
 * Displays a card for accessing AI chat functionality
 */
const AIChatCard: React.FC<AIChatCardProps> = ({ onClick, className = '' }) => {

  return (
    <Card 
      className={`bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 cursor-pointer transition-all duration-200 hover:shadow-lg ${className}`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-green-500 text-white">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                AI Chat
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mit der AI über Ihre Finanzen sprechen
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
          <Bot className="h-4 w-4" />
          <span>Interaktive Beratung</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Stellen Sie Fragen zu Ihrem Portfolio
        </p>
      </CardContent>
    </Card>
  );
};

export default AIChatCard;
