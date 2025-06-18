import { Liability } from '../../../../types/domains/financial/';

export const calculateLiabilityMonthlyPayment = (liability: Liability): number => {
    if (!liability.paymentSchedule) {
        return 0;
    }

    switch (liability.paymentSchedule.frequency) {
        case 'monthly':
            return liability.paymentSchedule.amount;
        case 'quarterly':
            return liability.paymentSchedule.amount * 4 / 12;
        case 'annually':
            return liability.paymentSchedule.amount / 12;
        case 'custom':
            if (liability.paymentSchedule.customAmounts) {
                const totalYearlyAmount = Object.values(liability.paymentSchedule.customAmounts)
                    .reduce((sum: number, amount: number) => sum + amount, 0);
                return totalYearlyAmount / 12;
            }
            return 0;
        default:
            return 0;
    }
};

export const calculateTotalDebt = (liabilities: Liability[]): number => {
    return liabilities.reduce((total, liability) => total + liability.currentBalance, 0);
};

export const calculateTotalMonthlyLiabilityPayments = (liabilities: Liability[]): number => {
    return liabilities.reduce((total, liability) => total + calculateLiabilityMonthlyPayment(liability), 0);
};
