import React from 'react';
import { useTranslation } from 'react-i18next';
import { ViewHeader, Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@ui/shared';
import { useDeviceCheck } from '@service/shared/utilities/helper/useDeviceCheck';
import type { AIChatViewProps } from '@/types/domains/analytics/ai';
import { 
  Brain, 
  Send, 
  User, 
  Bot,
  Loader2,
  MessageCircle,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Info,
  BarChart3,
  PieChart
} from 'lucide-react';

const getModelStatusVariant = (status: string) => {
  if (status === 'loaded') return 'success';
  if (status === 'loading') return 'warning';
  return 'destructive';
};

const AIChatView: React.FC<AIChatViewProps> = ({
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
  onInputChange,
  onSendMessage,
  onKeyPress,
  onClearChat,
  onSuggestedQuestionClick,
  formatTimestamp,
  viewMode,
  setViewMode
}) => {
  const { t } = useTranslation();
  const isDesktop = useDeviceCheck();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4">
        <ViewHeader
          title={t('ai.chat.title')}
          subtitle={t('ai.chat.subtitle')}
          onBack={onBack}
          isMobile={!isDesktop}
        />

        {/* Model Status and Chat Mode Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('ai.model.status')}: 
              </span>
              <Badge variant={getModelStatusVariant(modelStatus)}>
                {t(`ai.model.states.${modelStatus}`)}
              </Badge>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-800">
                <button
                  onClick={() => setViewMode('financialOverview')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'financialOverview'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <BarChart3 className="h-3 w-3" />
                  <span>{t('ai.chat.mode.financial_overview')}</span>
                </button>
                <button
                  onClick={() => setViewMode('allAssets')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'allAssets'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <PieChart className="h-3 w-3" />
                  <span>{t('ai.chat.mode.all_assets')}</span>
                </button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClearChat}
                disabled={messages.length === 0}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                {t('ai.chat.clear')}
              </Button>
            </div>
          </div>
          
          {/* Mode Description */}
          <div className="mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {viewMode === 'financialOverview' 
                ? t('ai.chat.mode.financial_overview_description')
                : t('ai.chat.mode.all_assets_description')
              }
            </p>
          </div>
        </div>

        {/* Financial Context - only show in financial overview mode */}
        {viewMode === 'financialOverview' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm">
                <Info className="h-4 w-4 text-blue-600" />
                <span>{t('ai.chat.context.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">{t('analytics.overview.net_worth')}</p>
                    <p className="font-medium">€{financialSnapshot.netWorth.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">{t('analytics.overview.monthlyIncome')}</p>
                    <p className="font-medium">€{financialSnapshot.monthlyIncome.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('analytics.overview.totalAssets')}</p>
                  <p className="font-medium">€{financialSnapshot.totalAssets.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('analytics.overview.assetsCount')}</p>
                  <p className="font-medium">{assets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assets Context - only show in all assets mode */}
        {viewMode === 'allAssets' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm">
                <PieChart className="h-4 w-4 text-blue-600" />
                <span>{t('ai.chat.context.assets_title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>{t('ai.chat.context.assets_description', { count: assets.length })}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Messages */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && modelStatus === 'loaded' && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('ai.chat.empty_state')}</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-xs md:max-w-md ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' 
                          ? 'text-blue-100' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center space-x-1">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {t('ai.chat.typing')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm">{t('ai.chat.suggestions.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => onSuggestedQuestionClick(question)}
                    className="text-left p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-colors"
                    disabled={isTyping || modelStatus !== 'loaded'}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Input Area */}
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyPress={onKeyPress}
                placeholder={t('ai.chat.input_placeholder')}
                disabled={isTyping || modelStatus !== 'loaded'}
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <Button
                onClick={onSendMessage}
                disabled={!inputValue.trim() || isTyping || modelStatus !== 'loaded'}
                className="px-4 py-2"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t('ai.chat.disclaimer')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIChatView;
