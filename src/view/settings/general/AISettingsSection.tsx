import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/common/Card';
import { Button } from '@/ui/common/Button';
import { Badge } from '@/ui/common/Badge';
import { Toggle } from '@/ui/common/Toggle';
import { AlertCircle, Brain, Download, CheckCircle, Loader2, Info } from 'lucide-react';
import { useLLMService } from '@/hooks/useLLMService';
import { getAvailableModels } from '@/config/aiModelConfig';

interface AISettingsSectionProps {
  isAIEnabled: boolean;
  onAIToggle: (enabled: boolean) => void;
}

/**
 * AI Settings Section Component
 * Manages AI model configuration and loading
 */
export const AISettingsSection: React.FC<AISettingsSectionProps> = ({
  isAIEnabled,
  onAIToggle
}) => {
  const { t } = useTranslation();
  const { 
    modelStatus, 
    isLoading, 
    error, 
    modelConfig, 
    loadModel, 
    clearError,
    modelMode
  } = useLLMService();

  const [selectedModelId, setSelectedModelId] = useState<string>('tinyllama');
  const [showModelDetails, setShowModelDetails] = useState(false);

  const availableModels = getAvailableModels();

  // Auto-select TinyLlama if no model is selected
  useEffect(() => {
    if (!selectedModelId && availableModels.length > 0) {
      setSelectedModelId(availableModels[0].id);
    }
  }, [selectedModelId, availableModels]);

  const handleLoadModel = async () => {
    const selectedModel = availableModels.find(m => m.id === selectedModelId);
    if (!selectedModel) return;

    try {
      clearError();
      await loadModel(selectedModel.config);
    } catch (err) {
      console.error('Failed to load model:', err);
    }
  };

  const getStatusBadgeVariant = () => {
    switch (modelStatus) {
      case 'loaded': return 'success';
      case 'loading': return 'warning';
      case 'error': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (modelStatus) {
      case 'loaded': return <CheckCircle className="h-4 w-4" />;
      case 'loading': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>{t('ai.settings.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('ai.settings.enable_ai')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('ai.settings.enable_ai_description')}
            </p>
          </div>
          <Toggle
            checked={isAIEnabled}
            onChange={onAIToggle}
            id="ai-toggle"
          />
        </div>

        {isAIEnabled && (
          <>
            {/* Model Status */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('ai.settings.model_status')}
                </h4>
                <Badge variant={getStatusBadgeVariant()} className="flex items-center space-x-1">
                  {getStatusIcon()}
                  <span>{t(`ai.model.states.${modelStatus}`)}</span>
                </Badge>
              </div>

              {modelConfig && modelStatus === 'loaded' && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <p><strong>{t('ai.settings.loaded_model')}:</strong> {modelConfig.modelName}</p>
                  <p><strong>{t('ai.settings.mode')}:</strong> {modelMode}</p>
                  <p><strong>{t('ai.settings.size')}:</strong> {modelConfig.metadata?.modelSize}</p>
                </div>
              )}

              {error && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
            </div>

            {/* Model Selection */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                {t('ai.settings.select_model')}
              </h4>
              
              <div className="space-y-3">
                {availableModels.map((model) => (
                  <div
                    key={model.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedModelId === model.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedModelId(model.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {model.name}
                          </h5>
                          {model.recommended && (
                            <Badge variant="success" className="text-xs">
                              {t('ai.settings.recommended')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {model.description}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {t('ai.settings.size')}: {model.size}
                        </p>
                      </div>
                      <div className="ml-3">
                        <input
                          type="radio"
                          checked={selectedModelId === model.id}
                          onChange={() => setSelectedModelId(model.id)}
                          className="text-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Load Model Button */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleLoadModel}
                disabled={isLoading || modelStatus === 'loading'}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>
                  {isLoading 
                    ? t('ai.settings.loading_model') 
                    : t('ai.settings.load_model')
                  }
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModelDetails(!showModelDetails)}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>

            {/* Model Details */}
            {showModelDetails && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  {t('ai.settings.how_it_works')}
                </h5>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• {t('ai.settings.how_it_works_1')}</li>
                  <li>• {t('ai.settings.how_it_works_2')}</li>
                  <li>• {t('ai.settings.how_it_works_3')}</li>
                  <li>• {t('ai.settings.how_it_works_4')}</li>
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
