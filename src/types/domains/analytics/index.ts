/**
 * Analytics domain types
 */

export * from './projections';
export * from './recommendations';
export * from './reporting';

// Explizite Re-Exports zur Konfliktvermeidung
export type { RecommendationCategory, RecommendationPriority, FinancialMetrics } from './reporting';
