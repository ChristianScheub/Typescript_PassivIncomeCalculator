import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Activity,
  TrendingUp,
  Wallet,
  Landmark,
  Calendar,
  Filter,
  Download,
  Upload,
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/common/Card';
import { ViewHeader } from '../../../ui/layout/ViewHeader';
import { Button } from '../../../ui/common/Button';
import TabSelector from '../../../ui/navigation/TabSelector';
import formatService from '../../../service/formatService';
import { useDeviceCheck } from '../../../service/helper/useDeviceCheck';

// Transaction Types
export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'asset_purchase' | 'asset_sale' | 'liability_payment' | 'transfer';
  category: string;
  subcategory?: string;
  title: string;
  description?: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'scheduled' | 'failed';
  account?: string;
  tags?: string[];
  relatedEntityId?: string; // Link to asset, income, expense, or liability
  relatedEntityType?: 'asset' | 'income' | 'expense' | 'liability';
  metadata?: {
    paymentMethod?: string;
    reference?: string;
    location?: string;
    notes?: string;
  };
}

export interface TransactionSummary {
  totalTransactions: number;
  totalInflow: number;
  totalOutflow: number;
  netFlow: number;
  pendingTransactions: number;
  scheduledTransactions: number;
  byCategory: Array<{
    category: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  byType: Array<{
    type: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
}

export interface TransactionFilters {
  dateRange: {
    start: string;
    end: string;
  };
  types: string[];
  categories: string[];
  status: string[];
  amountRange: {
    min: number;
    max: number;
  };
  searchQuery: string;
}

interface TransactionCenterViewProps {
  transactions: Transaction[];
  summary: TransactionSummary;
  filters: TransactionFilters;
  isLoading: boolean;
  onBack?: () => void;
  onFilterChange: (filters: TransactionFilters) => void;
  onTransactionAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onTransactionEdit: (id: string, transaction: Partial<Transaction>) => void;
  onTransactionDelete: (id: string) => void;
  onExportTransactions: (format: 'csv' | 'excel' | 'pdf') => void;
  onImportTransactions: (file: File) => void;
}

type TransactionTab = 'overview' | 'recent' | 'scheduled' | 'analytics';

const TransactionCenterView: React.FC<TransactionCenterViewProps> = ({
  transactions,
  summary,
  filters,
  isLoading,
  onBack,
  onFilterChange,
  onTransactionDelete,
  onExportTransactions,
  onImportTransactions
}) => {
  const { t } = useTranslation();
  const isDesktop = useDeviceCheck();
  
  // Local state
  const [selectedTab, setSelectedTab] = useState<TransactionTab>('overview');

  const tabs = [
    { id: 'overview', label: t('transactions.overview', 'Overview') },
    { id: 'recent', label: t('transactions.recent', 'Recent') },
    { id: 'scheduled', label: t('transactions.scheduled', 'Scheduled') },
    { id: 'analytics', label: t('transactions.analytics', 'Analytics') }
  ];

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'expense':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'asset_purchase':
        return <Wallet className="w-4 h-4 text-blue-500" />;
      case 'asset_sale':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'liability_payment':
        return <Landmark className="w-4 h-4 text-orange-500" />;
      case 'transfer':
        return <Activity className="w-4 h-4 text-gray-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAmountColor = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
      case 'asset_sale':
        return 'text-green-600 dark:text-green-400';
      case 'expense':
      case 'asset_purchase':
      case 'liability_payment':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatTransactionAmount = (amount: number, type: Transaction['type']) => {
    const prefix = ['income', 'asset_sale'].includes(type) ? '+' : '-';
    return `${prefix}${formatService.formatCurrency(Math.abs(amount))}`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('transactions.totalTransactions', 'Total Transactions')}
                </p>
                <p className="text-2xl font-bold">
                  {summary.totalTransactions}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('transactions.totalInflow', 'Total Inflow')}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatService.formatCurrency(summary.totalInflow)}
                </p>
              </div>
              <ArrowDownLeft className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('transactions.totalOutflow', 'Total Outflow')}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatService.formatCurrency(summary.totalOutflow)}
                </p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('transactions.netFlow', 'Net Flow')}
                </p>
                <p className={`text-2xl font-bold ${
                  summary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {summary.netFlow >= 0 ? '+' : ''}{formatService.formatCurrency(summary.netFlow)}
                </p>
              </div>
              <TrendingUp className={`w-8 h-8 ${
                summary.netFlow >= 0 ? 'text-green-500' : 'text-red-500'
              }`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('transactions.quickActions', 'Quick Actions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-16 flex flex-col gap-2"
              onClick={() => {/* TODO: Add transaction functionality */}}
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">{t('transactions.addTransaction', 'Add Transaction')}</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 flex flex-col gap-2"
              onClick={() => onExportTransactions('csv')}
            >
              <Download className="w-5 h-5" />
              <span className="text-xs">{t('transactions.export', 'Export')}</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 flex flex-col gap-2"
              onClick={() => document.getElementById('import-file')?.click()}
            >
              <Upload className="w-5 h-5" />
              <span className="text-xs">{t('transactions.import', 'Import')}</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 flex flex-col gap-2"
              onClick={() => setSelectedTab('analytics')}
            >
              <Activity className="w-5 h-5" />
              <span className="text-xs">{t('transactions.analytics', 'Analytics')}</span>
            </Button>
          </div>

          <input
            id="import-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportTransactions(file);
            }}
          />
        </CardContent>
      </Card>

      {/* Recent Transactions Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('transactions.recentTransactions', 'Recent Transactions')}</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedTab('recent')}
          >
            {t('transactions.viewAll', 'View All')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                onClick={() => {/* TODO: Show transaction details */}}
              >
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="font-medium">{transaction.title}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(transaction.status)}
                  <span className={`font-semibold ${getAmountColor(transaction.type)}`}>
                    {formatTransactionAmount(transaction.amount, transaction.type)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRecent = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('transactions.searchPlaceholder', 'Search transactions...')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  value={filters.searchQuery}
                  onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              {t('transactions.filters', 'Filters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('transactions.allTransactions', 'All Transactions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center space-x-4">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="font-medium">{transaction.title}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.category}
                      {transaction.description && ` • ${transaction.description}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()} • {transaction.account}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
                      {formatTransactionAmount(transaction.amount, transaction.type)}
                    </p>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(transaction.status)}
                      <span className="text-xs text-gray-500 capitalize">
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => {/* TODO: Edit transaction */}}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onTransactionDelete(transaction.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderScheduled = () => {
    const scheduledTransactions = transactions.filter(t => t.status === 'scheduled');
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('transactions.scheduledTransactions', 'Scheduled Transactions')}</CardTitle>
          </CardHeader>
          <CardContent>
            {scheduledTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {t('transactions.noScheduled', 'No scheduled transactions')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/10"
                  >
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">{transaction.title}</p>
                        <p className="text-sm text-gray-500">
                          {t('transactions.scheduledFor', 'Scheduled for')} {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${getAmountColor(transaction.type)}`}>
                        {formatTransactionAmount(transaction.amount, transaction.type)}
                      </span>
                      <Button variant="outline" size="sm">
                        {t('transactions.execute', 'Execute')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('transactions.byCategory', 'By Category')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.byCategory.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{category.category}</p>
                    <p className="text-sm text-gray-500">{category.count} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatService.formatCurrency(category.amount)}</p>
                    <p className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('transactions.byType', 'By Type')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.byType.map((type) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTransactionIcon(type.type as Transaction['type'])}
                    <div>
                      <p className="font-medium capitalize">{type.type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">{type.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatService.formatCurrency(type.amount)}</p>
                    <p className="text-sm text-gray-500">{type.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverview();
      case 'recent':
        return renderRecent();
      case 'scheduled':
        return renderScheduled();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ViewHeader
          title={t('transactions.center', 'Transaction Center')}
          subtitle={t('transactions.centerSubtitle', 'Unified transaction management across all portfolio categories')}
          onBack={onBack}
          isMobile={!isDesktop}
        />

        {/* Tab Navigation */}
        <div className="mb-8">
          <TabSelector
            tabs={tabs}
            selectedTab={selectedTab}
            onTabChange={(id) => setSelectedTab(id as TransactionTab)}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export default TransactionCenterView;
