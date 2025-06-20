import { DollarSign, CreditCard, Wallet, Target } from 'lucide-react';
import { QuickAction, NavigationHandlers } from '../interfaces/IConfigService';

export const getDashboardQuickActions = (handlers: NavigationHandlers): QuickAction[] => [
  {
    id: 'income',
    icon: DollarSign,
    color: 'text-green-500',
    translationKey: 'dashboard.addIncome',
    onClick: handlers.onAddIncome
  },
  {
    id: 'expense',
    icon: CreditCard,
    color: 'text-red-500',
    translationKey: 'dashboard.addExpense',
    onClick: handlers.onAddExpense
  },
  {
    id: 'asset',
    icon: Wallet,
    color: 'text-blue-500',
    translationKey: 'dashboard.recordTransaction',
    onClick: handlers.onAddTransaction
  },
  {
    id: 'debt',
    icon: Target,
    color: 'text-orange-500',
    translationKey: 'dashboard.payDebt',
    onClick: handlers.onAddLiability
  }
];
