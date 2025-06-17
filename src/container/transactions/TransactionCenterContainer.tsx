import React, { useState, useMemo } from 'react';
import { useAppSelector } from '../../hooks/redux';
import TransactionCenterView, { Transaction, TransactionSummary, TransactionFilters } from '../../view/finance-hub/transactions/TransactionCenterView';
import Logger from '../../service/Logger/logger';
import { useTranslation } from 'react-i18next';
import { Asset, Income, Expense, Liability } from '../../types';

interface TransactionCenterContainerProps {
  onBack?: () => void;
}

const TransactionCenterContainer: React.FC<TransactionCenterContainerProps> = ({ onBack }) => {
  const { t } = useTranslation();
  
  // Get data from Redux store
  const assets = useAppSelector(state => state.assets.items);
  const income = useAppSelector(state => state.income.items);
  const expenses = useAppSelector(state => state.expenses.items);
  const liabilities = useAppSelector(state => state.liabilities.items);
  
  // Local state
  const [filters, setFilters] = useState<TransactionFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
      end: new Date().toISOString().split('T')[0]
    },
    types: [],
    categories: [],
    status: [],
    amountRange: {
      min: 0,
      max: 999999
    },
    searchQuery: ''
  });

  // Generate transactions from existing data
  const transactions = useMemo<Transaction[]>(() => {
    const allTransactions: Transaction[] = [];

    // Generate transactions from assets (purchases)
    assets.forEach((asset: Asset) => {
      allTransactions.push({
        id: `asset-${asset.id}`,
        type: 'asset_purchase',
        category: asset.type || 'stocks',
        title: `${t('transactions.purchased', 'Purchased')} ${asset.name}`,
        description: `${asset.purchaseQuantity || 1} shares`,
        amount: (asset.purchasePrice || 0) * (asset.purchaseQuantity || 1),
        date: asset.purchaseDate,
        status: 'completed',
        account: 'Investment Account',
        relatedEntityId: asset.id,
        relatedEntityType: 'asset',
        metadata: {
          paymentMethod: 'Bank Transfer',
          reference: asset.assetDefinition?.ticker || asset.name,
          notes: asset.notes || ''
        }
      });
    });

    // Generate transactions from income sources
    income.forEach((incomeItem: Income) => {
      // Generate monthly transactions for the last 6 months
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        allTransactions.push({
          id: `income-${incomeItem.id}-${i}`,
          type: 'income',
          category: incomeItem.type,
          title: incomeItem.name,
          description: `Monthly ${incomeItem.type} payment`,
          amount: incomeItem.paymentSchedule.amount,
          date: date.toISOString().split('T')[0],
          status: i === 0 ? 'pending' : 'completed',
          account: 'Main Account',
          relatedEntityId: incomeItem.id,
          relatedEntityType: 'income',
          tags: incomeItem.isPassive ? ['passive'] : ['active'],
          metadata: {
            paymentMethod: 'Direct Deposit',
            notes: incomeItem.isPassive ? 'Passive income' : 'Active income'
          }
        });
      }
    });

    // Generate transactions from expenses
    expenses.forEach((expense: Expense) => {
      // Generate monthly transactions for the last 6 months
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        allTransactions.push({
          id: `expense-${expense.id}-${i}`,
          type: 'expense',
          category: expense.category,
          title: expense.name,
          description: `Monthly ${expense.category} expense`,
          amount: expense.paymentSchedule.amount,
          date: date.toISOString().split('T')[0],
          status: i === 0 ? 'pending' : 'completed',
          account: 'Main Account',
          relatedEntityId: expense.id,
          relatedEntityType: 'expense',
          metadata: {
            paymentMethod: 'Auto Payment',
            reference: `${expense.category}-${Date.now()}`
          }
        });
      }
    });

    // Generate transactions from liability payments
    liabilities.forEach((liability: Liability) => {
      if (liability.paymentSchedule) {
        // Generate monthly transactions for the last 6 months
        for (let i = 0; i < 6; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          
          allTransactions.push({
            id: `liability-${liability.id}-${i}`,
            type: 'liability_payment',
            category: liability.type,
            title: `${liability.name} Payment`,
            description: `Monthly payment for ${liability.type}`,
            amount: liability.paymentSchedule.amount,
            date: date.toISOString().split('T')[0],
            status: i === 0 ? 'scheduled' : 'completed',
            account: 'Main Account',
            relatedEntityId: liability.id,
            relatedEntityType: 'liability',
            metadata: {
              paymentMethod: 'Bank Transfer',
              reference: liability.name,
              notes: `Interest rate: ${liability.interestRate}%`
            }
          });
        }
      }
    });

    // Add some future scheduled transactions
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    
    allTransactions.push({
      id: 'scheduled-1',
      type: 'expense',
      category: 'utilities',
      title: 'Electricity Bill',
      amount: 150,
      date: futureDate.toISOString().split('T')[0],
      status: 'scheduled',
      account: 'Main Account',
      metadata: {
        paymentMethod: 'Auto Payment'
      }
    });

    // Sort by date (newest first)
    return allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [assets, income, expenses, liabilities, t]);

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Date range filter
      const transactionDate = new Date(transaction.date);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      if (transactionDate < startDate || transactionDate > endDate) {
        return false;
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(transaction.type)) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(transaction.category)) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(transaction.status)) {
        return false;
      }

      // Amount range filter
      if (transaction.amount < filters.amountRange.min || transaction.amount > filters.amountRange.max) {
        return false;
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          transaction.title.toLowerCase().includes(query) ||
          transaction.category.toLowerCase().includes(query) ||
          transaction.description?.toLowerCase().includes(query) ||
          false
        );
      }

      return true;
    });
  }, [transactions, filters]);

  // Calculate summary
  const summary = useMemo<TransactionSummary>(() => {
    const totalTransactions = filteredTransactions.length;
    
    let totalInflow = 0;
    let totalOutflow = 0;
    let pendingTransactions = 0;
    let scheduledTransactions = 0;

    filteredTransactions.forEach(transaction => {
      if (['income', 'asset_sale'].includes(transaction.type)) {
        totalInflow += transaction.amount;
      } else {
        totalOutflow += transaction.amount;
      }

      if (transaction.status === 'pending') {
        pendingTransactions++;
      } else if (transaction.status === 'scheduled') {
        scheduledTransactions++;
      }
    });

    const netFlow = totalInflow - totalOutflow;

    // Calculate by category
    const categoryMap = new Map<string, { count: number; amount: number }>();
    filteredTransactions.forEach(transaction => {
      const existing = categoryMap.get(transaction.category) || { count: 0, amount: 0 };
      categoryMap.set(transaction.category, {
        count: existing.count + 1,
        amount: existing.amount + transaction.amount
      });
    });

    const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      amount: data.amount,
      percentage: (data.count / totalTransactions) * 100
    })).sort((a, b) => b.amount - a.amount);

    // Calculate by type
    const typeMap = new Map<string, { count: number; amount: number }>();
    filteredTransactions.forEach(transaction => {
      const existing = typeMap.get(transaction.type) || { count: 0, amount: 0 };
      typeMap.set(transaction.type, {
        count: existing.count + 1,
        amount: existing.amount + transaction.amount
      });
    });

    const byType = Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      amount: data.amount,
      percentage: (data.count / totalTransactions) * 100
    })).sort((a, b) => b.amount - a.amount);

    return {
      totalTransactions,
      totalInflow,
      totalOutflow,
      netFlow,
      pendingTransactions,
      scheduledTransactions,
      byCategory,
      byType
    };
  }, [filteredTransactions]);

  const handleFilterChange = (newFilters: TransactionFilters) => {
    Logger.info(`Transaction filters changed: ${JSON.stringify(newFilters)}`);
    setFilters(newFilters);
  };

  const handleTransactionAdd = (transaction: Omit<Transaction, 'id'>) => {
    Logger.info(`Adding transaction: ${JSON.stringify(transaction)}`);
    // TODO: Implement actual transaction addition
    // This would typically dispatch to a Redux action
  };

  const handleTransactionEdit = (id: string, updates: Partial<Transaction>) => {
    Logger.info(`Editing transaction: ${id}, updates: ${JSON.stringify(updates)}`);
    // TODO: Implement actual transaction editing
  };

  const handleTransactionDelete = (id: string) => {
    Logger.info(`Deleting transaction: ${id}`);
    // TODO: Implement actual transaction deletion
  };

  const handleExportTransactions = (format: 'csv' | 'excel' | 'pdf') => {
    Logger.info(`Exporting transactions in format: ${format}`);
    
    // Create CSV content
    if (format === 'csv') {
      const headers = ['Date', 'Type', 'Category', 'Title', 'Amount', 'Status', 'Account'];
      const csvContent = [
        headers.join(','),
        ...filteredTransactions.map(t => [
          t.date,
          t.type,
          t.category,
          `"${t.title}"`,
          t.amount,
          t.status,
          t.account || ''
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleImportTransactions = (file: File) => {
    Logger.info(`Importing transactions from file: ${file.name}`);
    
    // TODO: Implement file parsing and transaction import
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      Logger.info(`File content loaded, size: ${content.length} characters`);
      // Parse CSV/Excel and create transactions
    };
    reader.readAsText(file);
  };

  return (
    <TransactionCenterView
      transactions={filteredTransactions}
      summary={summary}
      filters={filters}
      isLoading={false}
      onBack={onBack}
      onFilterChange={handleFilterChange}
      onTransactionAdd={handleTransactionAdd}
      onTransactionEdit={handleTransactionEdit}
      onTransactionDelete={handleTransactionDelete}
      onExportTransactions={handleExportTransactions}
      onImportTransactions={handleImportTransactions}
    />
  );
};

export default TransactionCenterContainer;
