export const calculateMonthlyCashFlow = (
    totalMonthlyIncome: number,
    totalMonthlyExpenses: number,
    totalMonthlyLiabilityPayments: number
): number => {
    return totalMonthlyIncome - totalMonthlyExpenses - totalMonthlyLiabilityPayments;
};
