// Analytics types - separated for clarity
export type AnalyticsCategory = 
  | 'overview' 
  | 'forecasting' 
  | 'milestones' 
  | 'distributions' 
  | 'performance' 
  | 'custom';

export type AnalyticsSubCategory = 
  // Overview
  | 'dashboard' 
  | 'summary'
  // Forecasting  
  | 'cashflow' 
  | 'portfolio' 
  | 'scenarios'
  // Milestones
  | 'fire' 
  | 'debt' 
  | 'savings' 
  | 'customMilestones'
  // Distributions
  | 'assets' 
  | 'income' 
  | 'expenses' 
  | 'geographic'
  // Performance
  | 'portfolioPerformance' 
  | 'returns' 
  | 'historical'
  // Custom (Asset Calendar)
  | 'calendar' 
  | 'history' 
  | 'timeline';
