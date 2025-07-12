import * as webllm from '@mlc-ai/web-llm';
import Logger from '@service/shared/logging/Logger/logger';

/**
 * Model Manager für mlc-ai/web-llm Integration
 * Verwaltet das Laden und die Verwendung von WebLLM-Modellen wie TinyLlama
 */
export class ModelManager {
  private engine: webllm.MLCEngine | null = null;
  private currentModel: string | null = null;
  private isInitialized = false;
  private loadingPromise: Promise<void> | null = null;

  /**
   * Lädt ein WebLLM Modell (z.B. TinyLlama)
   */
  async loadModel(modelId: string, _modelName?: string, progressCallback?: (progress: number) => void): Promise<void> {
    try {
      // Verhindere parallele Ladevorgänge
      if (this.loadingPromise) {
        await this.loadingPromise;
        return;
      }

      this.loadingPromise = this._loadModelInternal(modelId, progressCallback);
      await this.loadingPromise;
      this.loadingPromise = null;
    } catch (error) {
      this.loadingPromise = null;
      throw error;
    }
  }

  private async _loadModelInternal(modelId: string, progressCallback?: (progress: number) => void): Promise<void> {
    Logger.infoService(`ModelManager: Loading model ${modelId}...`);

    try {
      // Dispose existing engine if present
      if (this.engine) {
        await this.engine.unload();
        this.engine = null;
      }

      // Erstelle neue MLCEngine mit erweiterten Konfigurationen
      const engineConfig = {
        // Konfiguration für größeren Context Window
        initProgressCallback: (report: any) => {
          // Convert progress from decimal to percentage and round
          const progressPercentage = report.progress;
          Logger.infoService(`ModelManager: Loading progress: ${progressPercentage * 100}%`);
          
          // Call the progress callback if provided
          if (progressCallback) {
            progressCallback(progressPercentage);
          }
        }
      };

      this.engine = new webllm.MLCEngine(engineConfig);

      // Initialisiere Engine mit dem Modell
      await this.engine.reload(modelId);

      this.currentModel = modelId;
      this.isInitialized = true;

      Logger.infoService(`ModelManager: Model ${modelId} loaded successfully with enhanced configuration`);
    } catch (error) {
      this.engine = null;
      this.currentModel = null;
      this.isInitialized = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during model loading';
      Logger.error(`ModelManager: Failed to load model ${modelId}: ${errorMessage}`);
      throw new Error(`Failed to load model: ${errorMessage}`);
    }
  }

  /**
   * Generiert Text mit dem geladenen Modell und optimierter Token-Verwaltung
   */
  async generateText(prompt: string, maxTokens: number = 1024): Promise<string> {
    if (!this.isReady()) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    try {
      Logger.infoService(`ModelManager: Generating text with prompt length: ${prompt.length} characters`);
      Logger.infoService(`ModelManager: Using model ${this.currentModel} for text generation`);
      Logger.infoService('Prompt:' + prompt);
      const messages: webllm.ChatCompletionMessageParam[] = [
        {
          role: 'user',
          content: prompt
        }
      ];

      // Verwende nur unterstützte Parameter für WebLLM
      const completion = await this.engine!.chat.completions.create({
        messages,
        max_tokens: Math.min(maxTokens, 999999), // Begrenze auf 2048 für Stabilität
        temperature: 0.7,
        stream: false,
        // Weitere optimierte Parameter
        top_p: 0.9,
        frequency_penalty: 2,
        presence_penalty: -1,
      });

      const response = completion.choices[0]?.message?.content || '';
      Logger.infoService(`ModelManager: Generated ${response.length} characters successfully`);
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during text generation';
      Logger.error(`ModelManager: Text generation failed: ${errorMessage}`);
      
      // Versuche es mit kürzerem Prompt falls Token-Limit überschritten
      if (errorMessage.includes('prompt tokens exceed') || errorMessage.includes('context window')) {
        Logger.warn('ModelManager: Prompt too long, attempting with truncated version...');
        const truncatedPrompt = this.truncatePrompt(prompt, 4096); // Kürze auf ~4k Zeichen
        return this.generateTextWithTruncation(truncatedPrompt, maxTokens);
      }
      
      throw new Error(`Text generation failed: ${errorMessage}`);
    }
  }

  /**
   * Hilfsmethode um Prompts intelligent zu kürzen
   */
  private truncatePrompt(prompt: string, maxLength: number): string {
    if (prompt.length <= maxLength) {
      return prompt;
    }

    // Finde die Benutzer-Frage am Anfang
    // Refactored to use RegExp.exec() for better readability and maintainability
    const questionMatch = /^User Question: (.+?)(?=\n|$)/.exec(prompt);
    const userQuestion = questionMatch ? questionMatch[1] : '';

    // Behalte die wichtigsten Teile bei
    const sections = prompt.split('\n\n');
    let truncatedPrompt = userQuestion ? `User Question: ${userQuestion}\n\n` : '';
    
    // Füge die wichtigsten Sektionen hinzu, solange es unter dem Limit bleibt
    const importantSections = sections.filter(section => 
      section.includes('Portfolio Overview:') ||
      section.includes('Net Worth:') ||
      section.includes('Monthly Income:') ||
      section.includes('Assets Portfolio:') ||
      section.includes('Please provide')
    );

    for (const section of importantSections) {
      if ((truncatedPrompt + section).length < maxLength) {
        truncatedPrompt += section + '\n\n';
      }
    }

    return truncatedPrompt;
  }

  /**
   * Fallback-Methode für gekürzte Prompts
   */
  private async generateTextWithTruncation(prompt: string, maxTokens: number): Promise<string> {
    try {
      const messages: webllm.ChatCompletionMessageParam[] = [
        {
          role: 'user',
          content: prompt
        }
      ];

      const completion = await this.engine!.chat.completions.create({
        messages,
        max_tokens: Math.min(maxTokens, 1024), // Weitere Reduzierung
        temperature: 0.7,
        stream: false
      });

      return completion.choices[0]?.message?.content || 'AI analysis could not be generated due to prompt length constraints.';
    } catch (error) {
      Logger.error('ModelManager: Even truncated prompt failed');
      return 'Financial analysis temporarily unavailable. Please try again with a simpler request.';
    }
  }

  /**
   * Prüft ob das Modell bereit ist
   */
  isReady(): boolean {
    return this.isInitialized && this.engine !== null && this.currentModel !== null;
  }

  /**
   * Gibt den aktuellen Status zurück
   */
  getStatus() {
    return {
      isReady: this.isReady(),
      currentModel: this.currentModel,
      mode: this.engine ? 'webllm' : 'unloaded'
    };
  }

  /**
   * Gibt verfügbare Modelle zurück
   */
  static getAvailableModels(): { id: string; name: string; size: string; description: string }[] {
    return [
      {
        id: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC',
        name: 'TinyLlama Chat 1.1B',
        size: '~800MB',
        description: 'Kleines, schnelles Chat-Modell für lokale Verwendung'
      },
      {
        id: 'Llama-2-7b-chat-hf-q4f16_1-MLC',
        name: 'Llama 2 7B Chat',
        size: '~4GB',
        description: 'Leistungsstarkes Chat-Modell (mehr Speicher erforderlich)'
      },
      {
        id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
        name: 'Phi-3 Mini 4K',
        size: '~2GB',
        description: 'Microsoft Phi-3 Modell für Instruction Following'
      }
    ];
  }

  /**
   * Räumt Ressourcen auf
   */
  async dispose(): Promise<void> {
    if (this.engine) {
      try {
        await this.engine.unload();
        Logger.infoService('ModelManager: Model unloaded successfully');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown disposal error';
        Logger.error(`ModelManager: Error during model disposal: ${errorMsg}`);
      }
      this.engine = null;
    }
    
    this.currentModel = null;
    this.isInitialized = false;
  }
}

// Singleton-Instanz
export const modelManager = new ModelManager();
