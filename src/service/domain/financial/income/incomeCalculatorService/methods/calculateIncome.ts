import { Income } from '@/types/domains/financial';

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

export const calculatePassiveIncome = (incomes: Income[]): number => {
    // Only consider income entries marked as passive
    return incomes
        .filter(income => income.isPassive)
        .reduce((total, income) => total + calculateMonthlyIncome(income), 0);
};

/**
 * Berechnet das nächste Zahlungsdatum für ein Einkommen basierend auf dem dayOfMonth
 * @param income Das Einkommensobjekt
 * @param fromDate Das Startdatum für die Berechnung (optional, default: heute)
 * @returns Das nächste Zahlungsdatum
 */
export const calculateNextPaymentDate = (income: Income, fromDate?: Date): Date => {
    const baseDate = fromDate || new Date();
    const paymentDay = income.paymentSchedule.dayOfMonth || 1;
    
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
 * Überprüft, ob eine Zahlung an einem bestimmten Datum fällig ist
 * @param income Das Einkommensobjekt 
 * @param date Das zu prüfende Datum
 * @returns true wenn eine Zahlung fällig ist
 */
export const isPaymentDue = (income: Income, date: Date): boolean => {
    const paymentDay = income.paymentSchedule.dayOfMonth || 1;
    const currentDay = date.getDate();
    
    // Für monatliche Zahlungen: prüfe ob es der richtige Tag ist
    if (income.paymentSchedule.frequency === 'monthly') {
        return currentDay === paymentDay;
    }
    
    // Für andere Frequenzen: zusätzliche Logik könnte hier implementiert werden
    return false;
};
