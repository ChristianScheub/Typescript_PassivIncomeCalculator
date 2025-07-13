import type { LLMModelConfig } from '@/types/domains/ai';

/**
 * TinyLlama model configuration for mlc-ai/web-llm
 */
export const TINYLLAMA_MODEL_CONFIG: LLMModelConfig = {
  modelName: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC',
  modelPath: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC', // MLC model ID
  description: 'TinyLlama 1.1B Chat model running in browser via WebLLM',
  version: '1.0.0',
  capabilities: [
    'financial-analysis',
    'portfolio-advice',
    'text-generation',
    'conversational-ai'
  ],
  parameters: {
    maxTokens: 512,
    temperature: 0.7,
    topK: 40,
    topP: 0.9,
  },
  metadata: {
    author: 'TinyLlama Team',
    trainingData: 'General purpose text data',
    modelSize: '~800MB',
    supportedLanguages: ['en', 'de'],
    lastUpdated: '2024-01-01',
    note: 'Lightweight model optimized for browser inference'
  }
};

/**
 * Model configuration factory
 */
export const getModelConfig = (): LLMModelConfig => {
  // Immer TinyLlama in beiden Modi verwenden (da es browserbasiert ist)
  return TINYLLAMA_MODEL_CONFIG;
};

/**
 * Get available models for selection
 */
export const getAvailableModels = () => [
  {
    config: TINYLLAMA_MODEL_CONFIG,
    id: 'tinyllama',
    name: 'TinyLlama 1.1B',
    description: 'Schnelles, leichtgewichtiges Modell für lokale Inferenz',
    size: '~800MB',
    recommended: true
  },
  {
    config: {
      ...TINYLLAMA_MODEL_CONFIG,
      modelName: 'Llama-2-7b-chat-hf-q4f16_1-MLC',
      modelPath: 'Llama-2-7b-chat-hf-q4f16_1-MLC',
      metadata: {
        ...TINYLLAMA_MODEL_CONFIG.metadata,
        modelSize: '~4GB'
      }
    },
    id: 'llama2-7b',
    name: 'Llama 2 7B Chat',
    description: 'Leistungsstarkes Modell (mehr Speicher erforderlich)',
    size: '~4GB',
    recommended: false
  },
  {
    config: {
      ...TINYLLAMA_MODEL_CONFIG,
      modelName: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
      modelPath: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
      metadata: {
        ...TINYLLAMA_MODEL_CONFIG.metadata,
        modelSize: '~2GB'
      }
    },
    id: 'phi3-mini',
    name: 'Phi-3 Mini 4K',
    description: 'Microsoft Phi-3 für Instruction Following',
    size: '~2GB',
    recommended: false
  }
];

/**
 * Validate model configuration
 */
export const validateModelConfig = (config: LLMModelConfig): boolean => {
  const requiredFields = ['modelName', 'modelPath', 'description', 'version'];
  
  for (const field of requiredFields) {
    if (!config[field as keyof LLMModelConfig]) {
      console.error(`Model config validation failed: missing ${field}`);
      return false;
    }
  }
  
  return true;
};
