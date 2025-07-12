import { useState, useEffect, useCallback } from 'react';
import type { 
  LLMModelConfig, 
  LLMResponse, 
  ModelStatus,
  FinancialInsightRequest,
  FinancialInsightResponse 
} from '@/types/domains/ai';
import type { RootState } from '@/store';
import { financialInsightsService,modelManager } from '@service';
import Logger from '@service/shared/logging/Logger/logger';

/**
 * Hook for managing LLM service and financial insights with mlc-ai/web-llm integration
 * Provides functionality for model loading, message sending, and financial insights generation
 */
export const useLLMService = () => {
  const [modelStatus, setModelStatus] = useState<ModelStatus>('unloaded');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelConfig, setModelConfig] = useState<LLMModelConfig | null>(null);
  const [modelMode, setModelMode] = useState<string>('unknown');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  /**
   * Load the LLM model using mlc-ai/web-llm
   */
  const loadModel = useCallback(async (config: LLMModelConfig) => {
    try {
      setIsLoading(true);
      setError(null);
      setModelStatus('loading');
      setLoadingProgress(0);
      
      Logger.info(`useLLMService: Loading model ${config.modelName}`);
      
      // Progress callback to update loading progress
      const progressCallback = (progress: number) => {
        // Convert progress from decimal (0.47948723039556324) to percentage and round to nearest integer
        const progressPercentage = Math.round(progress * 100);
        setLoadingProgress(progressPercentage);
        Logger.info(`useLLMService: Loading progress: ${progressPercentage}%`);
      };
      
      // Use modelPath as model ID for MLC WebLLM
      await modelManager.loadModel(config.modelPath, config.modelName, progressCallback);
      
      // Get model mode from ModelManager
      const managerStatus = modelManager.getStatus();
      setModelMode(managerStatus.mode);
      
      setModelConfig(config);
      setModelStatus('loaded');
      setLoadingProgress(100);
      
      Logger.info(`useLLMService: Model ${config.modelName} loaded successfully in ${managerStatus.mode} mode`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load model';
      setError(errorMessage);
      setModelStatus('error');
      setLoadingProgress(0);
      Logger.error(`useLLMService: Failed to load model - ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Send a message to the LLM using mlc-ai/web-llm
   */
  const sendMessage = useCallback(async (message: string): Promise<LLMResponse | null> => {
    try {
      if (modelStatus !== 'loaded') {
        throw new Error('Model is not loaded');
      }

      setIsLoading(true);
      setError(null);
      
      const startTime = performance.now();
      const responseText = await modelManager.generateText(message, modelConfig?.parameters?.maxTokens || 512);
      const processingTime = performance.now() - startTime;
      
      // Convert raw text response to LLMResponse format for compatibility
      const response: LLMResponse = {
        content: responseText,
        confidence: 0.8, // Default confidence for WebLLM
        processingTime: Math.round(processingTime)
      };
      
      Logger.info(`useLLMService: Message processed successfully in ${processingTime.toFixed(2)}ms`);
      return response;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      Logger.error(`useLLMService: Failed to send message - ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [modelStatus, modelConfig]);

  /**
   * Generate financial insights from Redux state using WebLLM
   */
  const generateFinancialInsights = useCallback(async (
    reduxState: RootState,
    requestType: FinancialInsightRequest['requestType'] = 'general',
    customPrompt?: string
  ): Promise<FinancialInsightResponse | null> => {
    try {
      if (modelStatus !== 'loaded') {
        throw new Error('Model is not loaded');
      }

      setIsLoading(true);
      setError(null);
      
      const request: FinancialInsightRequest = {
        reduxState,
        requestType,
        customPrompt
      };
      
      const insights = await financialInsightsService.generateInsightsFromReduxState(request);
      
      Logger.info(`useLLMService: Financial insights generated successfully`);
      return insights;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate insights';
      setError(errorMessage);
      Logger.error(`useLLMService: Failed to generate insights - ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [modelStatus]);

  /**
   * Check model status on hook initialization
   */
  useEffect(() => {
    const checkModelStatus = () => {
      const status = modelManager.getStatus();
      if (status.isReady) {
        setModelStatus('loaded');
        setModelMode(status.mode);
      } else {
        setModelStatus('unloaded');
      }
    };

    checkModelStatus();
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Optional: Could add cleanup logic here if needed
    };
  }, []);

  return {
    // State
    modelStatus,
    isLoading,
    error,
    modelConfig,
    modelMode,
    loadingProgress,
    isModelReady: modelStatus === 'loaded',
    
    // Actions
    loadModel,
    sendMessage,
    generateFinancialInsights,
    
    // Utility
    clearError: useCallback(() => setError(null), [])
  };
};
