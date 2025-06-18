import { PaymentFrequency, DividendFrequency, ExpenseCategory, IncomeType, LiabilityType, AssetType } from '@/types/shared/base';

export interface PaymentFrequencyOption {
  value: PaymentFrequency;
  label: string;
}

export interface DividendFrequencyOption {
  value: DividendFrequency;
  label: string;
}

export interface CategoryOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Gets the payment frequency options with localized labels
 * @param t - Translation function from react-i18next
 * @returns Array of payment frequency options with translated labels
 */
export const getPaymentFrequencyOptions = (t: (key: string) => string): PaymentFrequencyOption[] => [
  { value: 'monthly', label: t('frequency.monthly') },
  { value: 'quarterly', label: t('frequency.quarterly') },
  { value: 'annually', label: t('frequency.annually') },
  { value: 'custom', label: t('frequency.custom') }
];

/**
 * Gets the dividend frequency options with localized labels (includes 'none' option)
 * @param t - Translation function from react-i18next
 * @returns Array of dividend frequency options with translated labels
 */
export const getDividendFrequencyOptions = (t: (key: string) => string): DividendFrequencyOption[] => [
  { value: 'monthly', label: t('frequency.monthly') },
  { value: 'quarterly', label: t('frequency.quarterly') },
  { value: 'annually', label: t('frequency.annually') },
  { value: 'custom', label: t('frequency.custom') },
  { value: 'none', label: t('frequency.none') }
];

/**
 * Gets the expense category options with localized labels
 * @param t - Translation function from react-i18next
 * @returns Array of expense category options with translated labels
 */
export const getExpenseCategoryOptions = (t: (key: string) => string): CategoryOption<ExpenseCategory>[] => [
  { value: 'housing', label: t('expenses.categories.housing') },
  { value: 'transportation', label: t('expenses.categories.transportation') },
  { value: 'food', label: t('expenses.categories.food') },
  { value: 'utilities', label: t('expenses.categories.utilities') },
  { value: 'insurance', label: t('expenses.categories.insurance') },
  { value: 'healthcare', label: t('expenses.categories.healthcare') },
  { value: 'entertainment', label: t('expenses.categories.entertainment') },
  { value: 'personal', label: t('expenses.categories.personal') },
  { value: 'debt_payments', label: t('expenses.categories.debt_payments') },
  { value: 'education', label: t('expenses.categories.education') },
  { value: 'subscriptions', label: t('expenses.categories.subscriptions') },
  { value: 'other', label: t('expenses.categories.other') }
];

/**
 * Gets the income type options with localized labels
 * @param t - Translation function from react-i18next
 * @returns Array of income type options with translated labels
 */
export const getIncomeTypeOptions = (t: (key: string) => string): CategoryOption<IncomeType>[] => [
  { value: 'salary', label: t('income.types.salary') },
  { value: 'interest', label: t('income.types.interest') },
  { value: 'side_hustle', label: t('income.types.side_hustle') },
  { value: 'other', label: t('income.types.other') }
];

/**
 * Gets the liability type options with localized labels
 * @param t - Translation function from react-i18next
 * @returns Array of liability type options with translated labels
 */
export const getLiabilityTypeOptions = (t: (key: string) => string): CategoryOption<LiabilityType>[] => [
  { value: 'mortgage', label: t('liabilities.types.mortgage') },
  { value: 'credit_card', label: t('liabilities.types.credit_card') },
  { value: 'personal_loan', label: t('liabilities.types.personal_loan') },
  { value: 'student_loan', label: t('liabilities.types.student_loan') },
  { value: 'auto_loan', label: t('liabilities.types.auto_loan') },
  { value: 'other', label: t('liabilities.types.other') }
];

/**
 * Gets the asset type options with localized labels
 * @param t - Translation function from react-i18next
 * @returns Array of asset type options with translated labels
 */
export const getAssetTypeOptions = (t: (key: string) => string): CategoryOption<AssetType>[] => [
  { value: 'stock', label: t('assets.types.stock') },
  { value: 'bond', label: t('assets.types.bond') },
  { value: 'real_estate', label: t('assets.types.real_estate') },
  { value: 'crypto', label: t('assets.types.crypto') },
  { value: 'cash', label: t('assets.types.cash') },
  { value: 'other', label: t('assets.types.other') }
];

/**
 * Payment frequency values as constants for validation and default values
 */
export const PAYMENT_FREQUENCIES = {
  MONTHLY: 'monthly' as const,
  QUARTERLY: 'quarterly' as const,
  ANNUALLY: 'annually' as const,
  CUSTOM: 'custom' as const
} as const;

/**
 * Array of all payment frequency values for validation
 */
export const PAYMENT_FREQUENCY_VALUES: PaymentFrequency[] = [
  PAYMENT_FREQUENCIES.MONTHLY,
  PAYMENT_FREQUENCIES.QUARTERLY,
  PAYMENT_FREQUENCIES.ANNUALLY,
  PAYMENT_FREQUENCIES.CUSTOM
];
