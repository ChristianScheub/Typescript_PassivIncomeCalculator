import { Expense } from '../../../../types/domains/financial/';

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
                const totalYearlyAmount = Object.values(expense.paymentSchedule.customAmounts).reduce((sum: number, amount: number) => sum + amount, 0);
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

/**
 * Berechnet das nächste Zahlungsdatum für eine Ausgabe basierend auf dem dayOfMonth
 * @param expense Das Ausgabenobjekt
 * @param fromDate Das Startdatum für die Berechnung (optional, default: heute)
 * @returns Das nächste Zahlungsdatum
 */
export const calculateNextExpenseDate = (expense: Expense, fromDate?: Date): Date => {
    const baseDate = fromDate || new Date();
    const paymentDay = expense.paymentSchedule.dayOfMonth || 1;
    
    const nextPayment = new Date(baseDate);
    nextPayment.setDate(paymentDay);
    
    // Wenn der Zahlungstag in diesem Monat bereits vorbei ist, nehme den nächsten Monat
    if (nextPayment <= baseDate) {
        nextPayment.setMonth(nextPayment.getMonth() + 1);
        nextPayment.setDate(paymentDay);
    }
    
    // Behandle den Fall, dass der gewünschte Tag im Monat nicht existiert (z.B. 31. Februar)
    if (nextPayment.getDate() !== paymentDay) {
        // Setze auf den letzten Tag des Monats
        nextPayment.setDate(0);
    }
    
    return nextPayment;
};

/**
 * Überprüft, ob eine Ausgabenzahlung an einem bestimmten Datum fällig ist
 * @param expense Das Ausgabenobjekt 
 * @param date Das zu prüfende Datum
 * @returns true wenn eine Zahlung fällig ist
 */
export const isExpensePaymentDue = (expense: Expense, date: Date): boolean => {
    const paymentDay = expense.paymentSchedule.dayOfMonth || 1;
    const currentDay = date.getDate();
    
    // Für monatliche Zahlungen: prüfe ob es der richtige Tag ist
    if (expense.paymentSchedule.frequency === 'monthly') {
        return currentDay === paymentDay;
    }
    
    // Für andere Frequenzen: zusätzliche Logik könnte hier implementiert werden
    return false;
};
