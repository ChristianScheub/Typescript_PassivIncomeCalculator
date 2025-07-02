import Logger from '@service/shared/logging/Logger/logger';
import type { AssetDefinition } from '@/types/domains/assets/entities';

/**
 * Types for AI Context Service
 */
export interface AssetWithValue {
  assetDefinitionId: string;
  asset?: {
    name?: string;
    type?: string;
  };
  currentValue?: number;
}

export interface FinancialSnapshot {
  totalAssets: number;
  monthlyIncome: number;
  totalExpenses: number;
  netWorth: number;
}

export interface FinancialData {
  income: any[];
  expenses: any[];
  liabilities: any[];
  assetFocusData?: {
    assetsWithValues?: AssetWithValue[];
    assetDefinitions?: AssetDefinition[];
  };
  financialSummary?: any;
}

/**
 * AI Context Service
 * Provides methods for creating AI chat context messages
 */
export class AIContextService {
  
  /**
   * Creates a compact asset summary grouped by type for AI prompt
   */
  static createAssetSummary(assetFocusData?: FinancialData['assetFocusData']): string {
    if (!assetFocusData?.assetsWithValues || assetFocusData.assetsWithValues.length === 0) {
      return '- No assets available';
    }

    // Group assets by type and calculate totals
    const assetsByType = assetFocusData.assetsWithValues.reduce((acc: any, assetWithValue: AssetWithValue) => {
      const type = assetWithValue.asset?.type || 'Unknown';
      if (!acc[type]) {
        acc[type] = { count: 0, totalValue: 0 };
      }
      acc[type].count += 1;
      acc[type].totalValue += assetWithValue.currentValue || 0;
      return acc;
    }, {});

    // Format the summary
    return Object.entries(assetsByType)
      .map(([type, data]: [string, any]) => 
        `- ${type}: ${data.count} assets, Total Value: €${data.totalValue.toLocaleString()}`
      )
      .join('\n');
  }

  /**
   * Fetches additional data (Sector, Country) for assetsWithValues
   */
  static fetchAssetDetails(assetDefinitionId: string, assetDefinitions?: AssetDefinition[]): { sector: string; country: string } {
    const assetDefinition = assetDefinitions?.find((def: AssetDefinition) => def.id === assetDefinitionId);
    
    if (!assetDefinition) {
      Logger.warn(`AIContextService: Asset definition not found for ID: ${assetDefinitionId}`);
      return { sector: 'Unknown', country: 'Unknown' };
    }
    
    // Handle sectors - take the first one or 'Unknown'
    const sector = assetDefinition?.sectors && assetDefinition.sectors.length > 0 
      ? assetDefinition.sectors[0].sector || assetDefinition.sectors[0].sectorName || 'Unknown'
      : 'Unknown';
    
    // Handle countries - take the first one or use the single country field
    const country = assetDefinition?.countries && assetDefinition.countries.length > 0 
      ? assetDefinition.countries[0].country || 'Unknown'
      : assetDefinition?.country || 'Unknown';
    
    Logger.info(`AIContextService: Asset ${assetDefinition.fullName}: Sector=${sector}, Country=${country}`);
    
    return {
      sector,
      country
    };
  }

  /**
   * Creates a detailed asset list for AI prompt with all asset details
   * Excludes assets with value €0
   */
  static createAllAssetsSummary(assetFocusData?: FinancialData['assetFocusData']): string {
    Logger.info('AIContextService: Creating all assets summary');
    
    if (!assetFocusData?.assetsWithValues || assetFocusData.assetsWithValues.length === 0) {
      Logger.warn('AIContextService: No assets with values found');
      return '- No assets available';
    }

    Logger.info(`AIContextService: Processing ${assetFocusData.assetsWithValues.length} assets with values`);
    Logger.info(`AIContextService: Asset definitions available: ${assetFocusData.assetDefinitions?.length || 0}`);

    // Filter out assets with value €0 or undefined/null
    const assetsWithValue = assetFocusData.assetsWithValues.filter((assetWithValue: AssetWithValue) => {
      const value = assetWithValue.currentValue || 0;
      return value > 0;
    });

    if (assetsWithValue.length === 0) {
      Logger.info('AIContextService: No assets with value > €0 found after filtering');
      return '- No assets with value available';
    }

    Logger.info(`AIContextService: After filtering out €0 assets: ${assetsWithValue.length} assets remaining`);

    return assetsWithValue
      .map((assetWithValue: AssetWithValue, index: number) => {
        const { sector, country } = AIContextService.fetchAssetDetails(
          assetWithValue.assetDefinitionId, 
          assetFocusData.assetDefinitions
        );
        
        Logger.info(`AIContextService: Asset ${index + 1}: ${assetWithValue.asset?.name} - Value: ${assetWithValue.currentValue}, Definition ID: ${assetWithValue.assetDefinitionId}`);
        
        return `- Name: ${assetWithValue.asset?.name || 'Unnamed'}, Type: ${assetWithValue.asset?.type || 'Unknown'}, Value: €${(assetWithValue.currentValue || 0).toLocaleString()}, Sector: ${sector}, Country: ${country}`;
      })
      .join('\n');
  }

  /**
   * Creates a comprehensive financial overview context message
   */
  static createFinancialOverviewContext(
    userQuestion: string,
    financialSnapshot: FinancialSnapshot,
    financialData: FinancialData
  ): string {
    Logger.info('AIContextService: Creating financial overview context');
    
    const { income, expenses, liabilities, assetFocusData, financialSummary } = financialData;
    
    function formatIncomeDetails(income: any[]): string {
      return income.map((inc: any) => `${inc.name || 'Unnamed'}: €${(inc.amount || 0).toLocaleString()}`).join(', ');
    }

    function formatExpenseDetails(expenses: any[]): string {
      return expenses.map((exp: any) => `${exp.name || 'Unnamed'}: €${(exp.paymentSchedule?.amount || 0).toLocaleString()}`).join(', ');
    }

    function formatLiabilityDetails(liabilities: any[]): string {
      return liabilities.map((lib: any) => `${lib.name || 'Unnamed'}: €${(lib.currentBalance || 0).toLocaleString()}`).join(', ');
    }

    return `User Question: ${userQuestion}
Background Context:

Portfolio Overview:
- Net Worth: €${financialSnapshot.netWorth.toLocaleString()}
- Total Assets Value: €${financialSnapshot.totalAssets.toLocaleString()}
- Monthly Income: €${financialSnapshot.monthlyIncome.toLocaleString()}
- Monthly Expenses: €${financialSnapshot.totalExpenses.toLocaleString()}
- Total Liabilities: €${liabilities.reduce((sum: number, lib: any) => sum + (lib.currentBalance || 0), 0).toLocaleString()}

Financial Summary & Calculations:
${financialSummary ? `- Financial Summary Available: Yes
- Summary Data: ${JSON.stringify(financialSummary, null, 2)}` : '- Financial Summary: Not available'}

Assets Portfolio Analysis:
${AIContextService.createAssetSummary(assetFocusData)}

Income Sources:
- Income Streams: ${income.length}
${income.length > 0 ? `- Income Details: ${formatIncomeDetails(income)}` : ''}

Expenses:
- Expense Items: ${expenses.length}
${expenses.length > 0 ? `- Expense Details: ${formatExpenseDetails(expenses)}` : ''}

Liabilities:
- Liability Items: ${liabilities.length}
${liabilities.length > 0 ? `- Liability Details: ${formatLiabilityDetails(liabilities)}` : ''}

=== END Background Information ===`;
  }

  /**
   * Creates an assets-focused context message with detailed asset information
   */
  static createAllAssetsContext(
    userQuestion: string,
    assetFocusData?: FinancialData['assetFocusData']
  ): string {
    Logger.info('AIContextService: Creating all assets context');
    
    return `User Question: ${userQuestion}
Background Context:

Assets Portfolio:
${AIContextService.createAllAssetsSummary(assetFocusData)}

=== END Background Information ===`;
  }
}

export default AIContextService;
