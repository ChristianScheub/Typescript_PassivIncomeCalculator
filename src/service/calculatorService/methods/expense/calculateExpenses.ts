import { Expense } from '../../../types';

export const calculateMonthlyExpense = (expense: Expense): number => {
    if (!expense.paymentSchedule) {
        return 0;
    }

    switch (expense.paymentSchedule.frequency) {
        case 'monthly':
            return expense.paymentSchedule.amount;
        case 'quarterly':
            return expense.paymentSchedule.amount * 4 / 12;
        case 'annually':
            return expense.paymentSchedule.amount / 12;
        case 'custom':
            if (expense.paymentSchedule.customAmounts) {
                const totalYearlyAmount = Object.values(expense.paymentSchedule.customAmounts).reduce((sum, amount) => sum + amount, 0);
                return totalYearlyAmount / 12;
            }
            return 0;
        default:
            return 0;
    }
};

export const calculateTotalMonthlyExpenses = (expenses: Expense[]): number => {
    return expenses.reduce((total, expense) => total + calculateMonthlyExpense(expense), 0);
};

export const calculateAnnualExpenses = (monthlyExpenses: number): number => {
    return monthlyExpenses * 12;
};
