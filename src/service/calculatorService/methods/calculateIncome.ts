import { Income, Asset } from '../../../types';
import { calculateAssetMonthlyIncome } from './calculateAssetIncome';

export const calculateMonthlyIncome = (income: Income): number => {
    if (!income.paymentSchedule) {
        return 0;
    }

    switch (income.paymentSchedule.frequency) {
        case 'monthly':
            return income.paymentSchedule.amount;
        case 'quarterly':
            return income.paymentSchedule.amount * 4 / 12;
        case 'annually':
            return income.paymentSchedule.amount / 12;
        case 'custom':
            if (income.paymentSchedule.customAmounts) {
                const totalYearlyAmount = Object.values(income.paymentSchedule.customAmounts).reduce((sum, amount) => sum + amount, 0);
                return totalYearlyAmount / 12;
            }
            return 0;
        default:
            return 0;
    }
};

export const calculateTotalMonthlyIncome = (incomes: Income[]): number => {
    return incomes.reduce((total, income) => total + calculateMonthlyIncome(income), 0);
};

export const calculateAnnualIncome = (monthlyIncome: number): number => {
    return monthlyIncome * 12;
};

export const calculatePassiveIncome = (incomes: Income[], assets: Asset[] = []): number => {
    // Get passive income from Income entries
    const regularPassiveIncome = incomes
        .filter(income => income.isPassive)
        .reduce((total, income) => total + calculateMonthlyIncome(income), 0);

    // Get passive income from assets (if not already counted in Income)
    const assetPassiveIncome = assets
        .filter(asset => !incomes.some(inc => inc.sourceId === asset.id))
        .reduce((total, asset) => total + calculateAssetMonthlyIncome(asset), 0);

    return regularPassiveIncome + assetPassiveIncome;
};
