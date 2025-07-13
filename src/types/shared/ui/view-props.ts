// Type definitions for view component props
import { TFunction } from 'i18next';
import { AssetFormData, ExpenseFormData, IncomeFormData, LiabilityFormData } from '../../domains/forms/form-data';
import { Asset, Expense, Income, Liability } from '../../domains/financial/entities';
import { BaseChartData } from '../charts';

// Translation function type
export interface TranslationProps {
  t: TFunction;
}

// Form submission handler types
export interface FormSubmissionHandlers<T> {
  onAdd: (data: T) => Promise<void> | void;
  onUpdate: (data: T) => Promise<void> | void;
}

// Asset-related view props
export interface AssetViewProps extends TranslationProps {
  onAddAsset: (data: AssetFormData) => Promise<void> | void;
  onUpdateAsset: (data: AssetFormData) => Promise<void> | void;
}

// Expense-related view props
export interface ExpenseViewProps extends TranslationProps {
  onAddExpense: (data: ExpenseFormData) => Promise<void> | void;
  onUpdateExpense: (data: ExpenseFormData) => Promise<void> | void;
}

// Income-related view props
export interface IncomeViewProps extends TranslationProps {
  onAddIncome: (data: IncomeFormData) => Promise<void> | void;
  onUpdateIncome: (data: IncomeFormData) => Promise<void> | void;
}

// Liability-related view props
export interface LiabilityViewProps extends TranslationProps {
  onAddLiability: (data: LiabilityFormData) => Promise<void> | void;
  onUpdateLiability: (data: LiabilityFormData) => Promise<void> | void;
}

// Category management types
export interface CategoryFormData {
  name: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  sortOrder?: number;
  [key: string]: unknown; // Index signature to allow additional properties
}

export interface OptionFormData {
  name: string;
  categoryId?: string;
  description?: string;
}

export interface CategoryManagerProps extends TranslationProps {
  categoryForm: {
    control: unknown; // TODO: Type this properly with react-hook-form
    handleSubmit: (callback: (data: CategoryFormData) => void) => (e?: React.BaseSyntheticEvent) => Promise<void>;
    reset: () => void;
  };
  optionForm: {
    control: unknown; // TODO: Type this properly with react-hook-form
    handleSubmit: (callback: (data: OptionFormData) => void) => (e?: React.BaseSyntheticEvent) => Promise<void>;
    reset: () => void;
  };
  onCategorySubmit: (data: CategoryFormData) => void;
  onOptionSubmit: (data: OptionFormData) => void;
  onDeleteCategory: (id: string) => void;
  onDeleteOption: (id: string) => void;
  onAddOptionToNewCategory: (optionData: OptionFormData) => void;
}

// Chart interaction types
export interface ChartInteractionProps {
  onBarClick?: (data: BaseChartData) => void;
}

// Calendar view props
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CalendarViewProps extends ChartInteractionProps {
  // Add specific calendar props here
}

// Loading view props
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LoadingViewProps extends TranslationProps {
  // Additional loading-specific props can be added here
}

// Generic list view props
export interface ListViewProps<T> extends TranslationProps {
  items: T[];
  onItemClick?: (item: T) => void;
  onItemEdit?: (item: T) => void;
  onItemDelete?: (item: T) => void;
}

// Specific list view props
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AssetListViewProps extends ListViewProps<Asset> {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ExpenseListViewProps extends ListViewProps<Expense> {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IncomeListViewProps extends ListViewProps<Income> {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LiabilityListViewProps extends ListViewProps<Liability> {}
