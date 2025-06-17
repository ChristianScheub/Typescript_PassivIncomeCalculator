import { AnalyticsCategory, AnalyticsSubCategory } from '../../container/analytics/AnalyticsHubContainer';

export interface AnalyticsHistoryEntry {
  category: AnalyticsCategory;
  subCategory: AnalyticsSubCategory;
  timestamp: number;
  title: string;
  icon: string; // Icon name for storage
}

class AnalyticsHistoryService {
  private readonly STORAGE_KEY = 'analytics_history';
  private readonly MAX_HISTORY_ENTRIES = 10;

  // Get analytics history from localStorage
  getHistory(): AnalyticsHistoryEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const history: AnalyticsHistoryEntry[] = JSON.parse(stored);
      return history.sort((a, b) => b.timestamp - a.timestamp); // Most recent first
    } catch (error) {
      console.error('Error loading analytics history:', error);
      return [];
    }
  }

  // Add new analytics entry to history
  addToHistory(
    category: AnalyticsCategory, 
    subCategory: AnalyticsSubCategory, 
    title: string,
    icon: string = 'PieChart'
  ): void {
    try {
      let history = this.getHistory();
      
      // Remove existing entry for same category/subcategory if exists
      history = history.filter(
        entry => !(entry.category === category && entry.subCategory === subCategory)
      );
      
      // Add new entry at the beginning
      const newEntry: AnalyticsHistoryEntry = {
        category,
        subCategory,
        timestamp: Date.now(),
        title,
        icon
      };
      
      history.unshift(newEntry);
      
      // Keep only the most recent entries
      if (history.length > this.MAX_HISTORY_ENTRIES) {
        history = history.slice(0, this.MAX_HISTORY_ENTRIES);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving analytics history:', error);
    }
  }

  // Get recent analytics (max 3 for display)
  getRecentAnalytics(maxEntries: number = 3): AnalyticsHistoryEntry[] {
    return this.getHistory().slice(0, maxEntries);
  }

  // Clear all history
  clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing analytics history:', error);
    }
  }

  // Get analytics title by category/subcategory with i18n support
  getAnalyticsTitle(category: AnalyticsCategory, subCategory: AnalyticsSubCategory, language: string = 'en'): string {
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
      'custom-builder': 'Chart Builder',
      'custom-saved': 'Saved Charts',
      'custom-templates': 'Chart Templates',
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
      'custom-builder': 'Chart-Builder',
      'custom-saved': 'Gespeicherte Charts',
      'custom-templates': 'Chart-Vorlagen',
      'milestones-fire': 'FIRE-Fortschritt',
      'milestones-debt': 'Schulden-Meilensteine',
      'milestones-savings': 'Sparziele',
      'forecasting-cashflow': 'Cashflow-Prognose',
      'forecasting-portfolio': 'Portfolio-Prognose',
      'forecasting-scenarios': 'Szenario-Planung'
    };
    
    const titleMap = language === 'de' ? titleMapDe : titleMapEn;
    return titleMap[`${category}-${subCategory}`] || 'Analytics';
  }

  // Get icon name by category/subcategory
  getAnalyticsIcon(category: AnalyticsCategory, subCategory: AnalyticsSubCategory): string {
    const iconMap: Record<string, string> = {
      'overview-dashboard': 'BarChart3',
      'overview-summary': 'PieChart',
      'distributions-assets': 'PieChart',
      'distributions-income': 'TrendingUp',
      'distributions-expenses': 'TrendingDown',
      'distributions-geographic': 'Globe',
      'performance-portfolioPerformance': 'Activity',
      'performance-returns': 'TrendingUp',
      'performance-historical': 'Calendar',
      'custom-builder': 'Settings',
      'custom-saved': 'Bookmark',
      'custom-templates': 'Copy',
      'milestones-fire': 'Target',
      'milestones-debt': 'CreditCard',
      'milestones-savings': 'PiggyBank',
      'forecasting-cashflow': 'TrendingUp',
      'forecasting-portfolio': 'LineChart',
      'forecasting-scenarios': 'GitBranch'
    };
    
    return iconMap[`${category}-${subCategory}`] || 'PieChart';
  }
}

const analyticsHistoryService = new AnalyticsHistoryService();
export default analyticsHistoryService;
