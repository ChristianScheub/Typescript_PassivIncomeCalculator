/**
 * Container component types
 */

import { AssetFormData, ExpenseFormData, IncomeFormData, LiabilityFormData } from '../../domains/forms/form-data';
import { BaseChartData } from '../charts';

// Generic container handlers
export interface ContainerHandlers<TFormData> {
  handleAdd: (data: TFormData) => Promise<void>;
  handleUpdate: (data: TFormData) => Promise<void>;
  handleDelete?: (id: string) => Promise<void>;
}

// Asset container types
export interface AssetContainerHandlers extends ContainerHandlers<AssetFormData> {
  handleAddAsset: (data: AssetFormData) => Promise<void>;
  handleUpdateAsset: (data: AssetFormData) => Promise<void>;
}

// Expense container types
export interface ExpenseContainerHandlers extends ContainerHandlers<ExpenseFormData> {
  handleAddExpense: (data: ExpenseFormData) => Promise<void>;
  handleUpdateExpense: (data: ExpenseFormData) => Promise<void>;
}

// Income container types
export interface IncomeContainerHandlers extends ContainerHandlers<IncomeFormData> {
  handleAddIncome: (data: IncomeFormData) => Promise<void>;
  handleUpdateIncome: (data: IncomeFormData) => Promise<void>;
}

// Liability container types
export interface LiabilityContainerHandlers extends ContainerHandlers<LiabilityFormData> {
  handleAddLiability: (data: LiabilityFormData) => Promise<void>;
  handleUpdateLiability: (data: LiabilityFormData) => Promise<void>;
}

// Chart interaction handlers
export interface ChartContainerHandlers {
  handleBarClick: (data: BaseChartData) => void;
}

// Asset definition container
export interface AssetDefinitionData {
  name: string;
  symbol: string;
  assetType: string;
  currency: string;
  exchange?: string;
  sector?: string;
  industry?: string;
  description?: string;
  isActive: boolean;
}

export interface AssetCategoryAssignment {
  id: string;
  assetId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetDefinitionHandlers {
  handleAddDefinition: (
    data: AssetDefinitionData, 
    categoryAssignments: Omit<AssetCategoryAssignment, 'id' | 'createdAt' | 'updatedAt'>[]
  ) => Promise<void>;
}

// Calendar container specific types
export interface CalendarContainerProps extends ChartContainerHandlers {
  // Calendar-specific props can be added here
   
}
