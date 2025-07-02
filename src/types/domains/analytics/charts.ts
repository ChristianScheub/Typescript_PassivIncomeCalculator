/**
 * Analytics chart configuration types
 */

import { ChartType, DataSource, GroupBy } from '@/types/shared/analytics';

export interface CustomAnalyticsConfig {
  id: string;
  chartType: ChartType;
  dataSource: DataSource;
  groupBy: GroupBy;
  title: string;
  selectedCategoryId?: string;
  selectedCategoryOptionId?: string;
  createdAt: string;
  updatedAt: string;
}
