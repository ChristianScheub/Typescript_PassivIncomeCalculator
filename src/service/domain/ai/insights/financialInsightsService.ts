import type { 
  FinancialInsightRequest, 
  FinancialInsightResponse,
  FinancialInsightsService as IFinancialInsightsService 
} from '@/types/domains/ai';
import type { RootState } from '@/store';
import { modelManager } from '../llm/modelManager';
import Logger from '@service/shared/logging/Logger/logger';

/**
 * Financial Insights Service
 * Erstellt KI-basierte Finanzanalysen und Empfehlungen
 */
class FinancialInsightsService implements IFinancialInsightsService {
  
  /**
   * Generiert finanzielle Einblicke basierend auf Redux State
   */
  async generateInsightsFromReduxState(request: FinancialInsightRequest): Promise<FinancialInsightResponse> {
    try {
      if (!modelManager.isReady()) {
        throw new Error('AI model not loaded. Please load a model first.');
      }

      Logger.info('FinancialInsightsService: Generating insights from Redux state');

      // Extrahiere relevante Finanzdaten aus Redux State
      const financialSummary = this.extractFinancialSummary(request.reduxState);
      
      // Erstelle kontextuellen Prompt
      const prompt = this.buildFinancialPrompt(financialSummary, request.requestType, request.customPrompt);
      
      // Generiere AI-Antwort
      const aiResponse = await modelManager.generateText(prompt, 512);
      
      // Parse und strukturiere die Antwort
      const structuredResponse = this.parseAIResponse(aiResponse, financialSummary);
      
      Logger.info('FinancialInsightsService: Insights generated successfully');
      return structuredResponse;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during insights generation';
      Logger.error(`FinancialInsightsService: ${errorMessage}`);
      throw new Error(`Failed to generate insights: ${errorMessage}`);
    }
  }

  /**
   * Extrahiert relevante Finanzdaten aus dem Redux State
   */
  private extractFinancialSummary(state: RootState) {
    const { transactions, income, expenses, liabilities } = state;
    
    return {
      totalAssets: transactions.cache?.totals?.totalValue || 0,
      monthlyIncome: transactions.cache?.totals?.monthlyIncome || 0,
      totalExpenses: expenses.items.reduce((sum: number, exp: any) => sum + (exp.paymentSchedule?.amount || 0), 0),
      totalLiabilities: liabilities.items.reduce((sum: number, lib: any) => sum + (lib.currentBalance || 0), 0),
      assetsCount: transactions.items.length,
      incomeCount: income.items.length,
      expensesCount: expenses.items.length,
      liabilitiesCount: liabilities.items.length,
      netWorth: (transactions.cache?.totals?.totalValue || 0) - 
                liabilities.items.reduce((sum: number, lib: any) => sum + (lib.currentBalance || 0), 0)
    };
  }

  /**
   * Erstellt einen kontextuellen Prompt für das AI-Modell
   */
  private buildFinancialPrompt(summary: any, requestType: string, customPrompt?: string): string {
    const contextPrompt = `Du bist ein erfahrener Finanzberater. Analysiere folgende Finanzsituation:

Finanzübersicht:
- Gesamtvermögen: €${summary.totalAssets.toLocaleString()}
- Monatseinkommen: €${summary.monthlyIncome.toLocaleString()}
- Monatliche Ausgaben: €${summary.totalExpenses.toLocaleString()}
- Verbindlichkeiten: €${summary.totalLiabilities.toLocaleString()}
- Nettovermögen: €${summary.netWorth.toLocaleString()}
- Anzahl Assets: ${summary.assetsCount}
- Anzahl Einkommensquellen: ${summary.incomeCount}
- Anzahl Ausgaben: ${summary.expensesCount}
- Anzahl Verbindlichkeiten: ${summary.liabilitiesCount}

`;

    // Füge anfragespezifischen Kontext hinzu
    switch (requestType) {
      case 'portfolio_analysis':
        return contextPrompt + 'Bitte analysiere das Portfolio und gib Empfehlungen zur Optimierung. Fokussiere auf Diversifikation und Risikomanagement.';
      case 'budget':
        return contextPrompt + 'Analysiere das Budget und gib Empfehlungen zur Ausgabenoptimierung und Sparstrategien.';
      case 'forecast':
        return contextPrompt + 'Erstelle eine Prognose für die finanzielle Entwicklung und gib langfristige Empfehlungen.';
      case 'custom':
        return contextPrompt + (customPrompt || 'Gib eine allgemeine Finanzanalyse.');
      default:
        return contextPrompt + 'Gib eine umfassende Finanzanalyse mit konkreten Handlungsempfehlungen.';
    }
  }

  /**
   * Parst und strukturiert die AI-Antwort
   */
  private parseAIResponse(aiResponse: string, financialSummary: any): FinancialInsightResponse {
    // Einfache Strukturierung der AI-Antwort
    const lines = aiResponse.split('\n').filter(line => line.trim());
    
    // Refactored to use RegExp.exec() for better readability and maintainability
    const recommendations = lines
      .filter(line => /^[-•*]\s*/.exec(line.trim()))
      .map(line => line.trim().replace(/^[-•*]\s*/, ''))
      .filter(rec => rec.length > 10); // Nur sinnvolle Empfehlungen

    const mainContent = lines
      .filter(line => !/^[-•*]\s*/.exec(line.trim()))
      .join(' ')
      .trim();

    const insight = mainContent || aiResponse;

    // Berechne Konfidenz basierend auf Datenqualität
    const confidence = this.calculateConfidence(financialSummary);

    return {
      insight,
      recommendations: recommendations.length > 0 ? recommendations : [
        'Überprüfen Sie regelmäßig Ihr Portfolio',
        'Diversifizieren Sie Ihre Investments',
        'Erstellen Sie einen Notfallfonds'
      ],
      confidence,
      dataUsed: [
        'Portfolio-Wert',
        'Einkommen und Ausgaben',
        'Verbindlichkeiten',
        'Asset-Allokation'
      ],
      generatedAt: new Date()
    };
  }

  /**
   * Berechnet Konfidenz basierend auf verfügbaren Daten
   */
  private calculateConfidence(summary: any): number {
    let confidence = 0.5; // Basis-Konfidenz

    // Erhöhe Konfidenz basierend auf verfügbaren Daten
    if (summary.totalAssets > 0) confidence += 0.1;
    if (summary.monthlyIncome > 0) confidence += 0.1;
    if (summary.assetsCount > 2) confidence += 0.1;
    if (summary.incomeCount > 0) confidence += 0.1;
    if (summary.totalExpenses > 0) confidence += 0.1;

    return Math.min(confidence, 0.9); // Max 90% Konfidenz
  }

  /**
   * Generiert Portfolio-spezifische Beratung
   */
  async generatePortfolioAdvice(portfolioData: any): Promise<FinancialInsightResponse> {
    try {
      if (!modelManager.isReady()) {
        throw new Error('AI model not loaded. Please load a model first.');
      }

      Logger.info('FinancialInsightsService: Generating portfolio advice');

      const prompt = `Du bist ein Portfolioberater. Analysiere folgende Portfolio-Daten und gib spezifische Empfehlungen:

Portfolio-Details:
- Gesamtwert: €${portfolioData.totalValue?.toLocaleString() || '0'}
- Anzahl Positionen: ${portfolioData.positions?.length || 0}
- Größte Position: ${portfolioData.largestPosition || 'Unbekannt'}
- Diversifikation: ${portfolioData.diversificationScore || 'Nicht bewertet'}

Gib konkrete Empfehlungen zur Portfoliooptimierung, Risikomanagement und Diversifikation.`;

      const aiResponse = await modelManager.generateText(prompt, 512);
      return this.parseAIResponse(aiResponse, portfolioData);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during portfolio advice generation';
      Logger.error(`FinancialInsightsService: ${errorMessage}`);
      throw new Error(`Failed to generate portfolio advice: ${errorMessage}`);
    }
  }

  /**
   * Generiert Budget-Empfehlungen
   */
  async generateBudgetRecommendations(financialData: any): Promise<FinancialInsightResponse> {
    try {
      if (!modelManager.isReady()) {
        throw new Error('AI model not loaded. Please load a model first.');
      }

      Logger.info('FinancialInsightsService: Generating budget recommendations');

      const prompt = `Du bist ein Budgetberater. Analysiere folgende Finanzdaten und gib Budget-Empfehlungen:

Budget-Details:
- Monatseinkommen: €${financialData.monthlyIncome?.toLocaleString() || '0'}
- Monatliche Ausgaben: €${financialData.monthlyExpenses?.toLocaleString() || '0'}
- Sparrate: ${financialData.savingsRate || '0'}%
- Größte Ausgabenkategorie: ${financialData.largestExpenseCategory || 'Unbekannt'}

Gib konkrete Empfehlungen zur Budgetoptimierung, Ausgabenreduzierung und Sparstrategien.`;

      const aiResponse = await modelManager.generateText(prompt, 512);
      return this.parseAIResponse(aiResponse, financialData);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during budget recommendations generation';
      Logger.error(`FinancialInsightsService: ${errorMessage}`);
      throw new Error(`Failed to generate budget recommendations: ${errorMessage}`);
    }
  }

  /**
   * Generiert Prognose-Einblicke
   */
  async generateForecastInsights(forecastData: any): Promise<FinancialInsightResponse> {
    try {
      if (!modelManager.isReady()) {
        throw new Error('AI model not loaded. Please load a model first.');
      }

      Logger.info('FinancialInsightsService: Generating forecast insights');

      const prompt = `Du bist ein Finanzprognostiker. Analysiere folgende Trend-Daten und erstelle eine Prognose:

Prognose-Daten:
- Aktuelles Vermögen: €${forecastData.currentNetWorth?.toLocaleString() || '0'}
- Wachstumstrend: ${forecastData.growthTrend || 'Unbekannt'}
- Monatliche Sparrate: €${forecastData.monthlySavings?.toLocaleString() || '0'}
- Prognosezeitraum: ${forecastData.timeHorizon || '1 Jahr'}

Erstelle eine realistische Finanzprognose mit konkreten Zielen und Empfehlungen für die Zukunft.`;

      const aiResponse = await modelManager.generateText(prompt, 512);
      return this.parseAIResponse(aiResponse, forecastData);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during forecast insights generation';
      Logger.error(`FinancialInsightsService: ${errorMessage}`);
      throw new Error(`Failed to generate forecast insights: ${errorMessage}`);
    }
  }
}

export const financialInsightsService = new FinancialInsightsService();
