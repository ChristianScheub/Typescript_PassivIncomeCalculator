
import { PortfolioCategory, PortfolioSubCategory } from '../types';
import { AnalyticsCategory, AnalyticsSubCategory } from '../types/analytics';

// Title Resolver for different activity types
export const createTitleResolver = () => {
  const getAnalyticsTitle = (
    category: AnalyticsCategory, 
    subCategory: AnalyticsSubCategory, 
    language: string = 'en'
  ): string => {
    const titleMapEn: Record<string, string> = {
      'overview-dashboard': 'Analytics Hub',
      'overview-summary': 'Financial Overview',
      'distributions-assets': 'Portfolio Distribution',
      'distributions-income': 'Income Analysis',
      'distributions-expenses': 'Expense Analysis',
      'distributions-geographic': 'Geographic Distribution',
      'performance-portfolioPerformance': 'Portfolio Performance',
      'performance-returns': 'Return Analysis',
      'performance-historical': 'Historical Analysis',
      'custom-calendar': 'Asset Calendar',
      'custom-history': 'Calendar History',
      'custom-timeline': 'Timeline View',
      'milestones-fire': 'FIRE Progress',
      'milestones-debt': 'Debt Milestones',
      'milestones-savings': 'Savings Goals',
      'forecasting-cashflow': 'Cash Flow Forecast',
      'forecasting-portfolio': 'Portfolio Forecast',
      'forecasting-scenarios': 'Scenario Planning'
    };
    
    const titleMapDe: Record<string, string> = {
      'overview-dashboard': 'Analytics Hub',
      'overview-summary': 'Finanz-Übersicht',
      'distributions-assets': 'Portfolio-Verteilung',
      'distributions-income': 'Einkommens-Analyse',
      'distributions-expenses': 'Ausgaben-Analyse',
      'distributions-geographic': 'Geografische Verteilung',
      'performance-portfolioPerformance': 'Portfolio-Performance',
      'performance-returns': 'Rendite-Analyse',
      'performance-historical': 'Historische Analyse',
      'custom-calendar': 'Asset Kalender',
      'custom-history': 'Kalender Historie',
      'custom-timeline': 'Timeline Ansicht',
      'milestones-fire': 'FIRE-Fortschritt',
      'milestones-debt': 'Schulden-Meilensteine',
      'milestones-savings': 'Sparziele',
      'forecasting-cashflow': 'Cashflow-Prognose',
      'forecasting-portfolio': 'Portfolio-Prognose',
      'forecasting-scenarios': 'Szenario-Planung'
    };
    
    const titleMap = language === 'de' ? titleMapDe : titleMapEn;
    return titleMap[`${category}-${subCategory}`] || 'Analytics';
  };

  const getPortfolioTitle = (
    category: PortfolioCategory,
    subCategory?: PortfolioSubCategory,
    language: string = 'en'
  ): string => {
    const titleMapEn: Record<string, string> = {
      'overview-dashboard': 'Portfolio Hub',
      'assets-portfolio': 'Asset Portfolio',
      'assets-definitions': 'Asset Definitions',
      'assets-categories': 'Asset Categories',
      'assets-calendar': 'Asset Calendar',
      'assets-history': 'Portfolio History',
      'liabilities-debts': 'Debt Management',
      'liabilities-payments': 'Payment Schedule',
      'liabilities-projections': 'Debt Projections',
      'income-sources': 'Income Sources',
      'income-streams': 'Income Streams',
      'expenses-categories': 'Expense Categories',
      'expenses-budgets': 'Budget Planning',
      'expenses-tracking': 'Expense Tracking',
      'transactions-recent': 'Recent Transactions',
      'transactions-import': 'Import Transactions',
      'transactions-export': 'Export Transactions'
    };

    const titleMapDe: Record<string, string> = {
      'overview-dashboard': 'Portfolio Hub',
      'assets-portfolio': 'Asset Portfolio',
      'assets-definitions': 'Asset Definitionen',
      'assets-categories': 'Asset Kategorien',
      'assets-calendar': 'Asset Kalender',
      'assets-history': 'Portfolio Historie',
      'liabilities-debts': 'Schulden-Management',
      'liabilities-payments': 'Zahlungsplan',
      'liabilities-projections': 'Schulden-Prognosen',
      'income-sources': 'Einkommensquellen',
      'income-streams': 'Einkommensströme',
      'expenses-categories': 'Ausgaben-Kategorien',
      'expenses-budgets': 'Budget-Planung',
      'expenses-tracking': 'Ausgaben-Tracking',
      'transactions-recent': 'Aktuelle Transaktionen',
      'transactions-import': 'Transaktionen Importieren',
      'transactions-export': 'Transaktionen Exportieren'
    };

    const titleMap = language === 'de' ? titleMapDe : titleMapEn;
    const key = subCategory ? `${category}-${subCategory}` : category;
    return titleMap[key] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  return {
    getAnalyticsTitle,
    getPortfolioTitle
  };
};
