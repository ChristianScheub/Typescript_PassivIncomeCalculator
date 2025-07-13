import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TransactionsStepData, SimplifiedTransaction, AssetTemplate, CustomAssetDefinition } from '@/types/domains/setupWizard';
import QuickDataImport from '@ui/setupWizard/QuickDataImport';

interface TransactionsStepProps {
  stepData: TransactionsStepData;
  availableAssets: (AssetTemplate | CustomAssetDefinition)[];
  onUpdateStepData: (data: Partial<TransactionsStepData>) => void;
  onAddTransaction: (transaction: SimplifiedTransaction) => void;
  onRemoveTransaction: (index: number) => void;
  onFileSelect?: (file: File, type: 'csv' | 'json') => void;
}

const TransactionsStep: React.FC<TransactionsStepProps> = ({
  stepData,
  availableAssets,
  onUpdateStepData,
  onAddTransaction,
  onRemoveTransaction,
  onFileSelect
}) => {
  const { t } = useTranslation();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState<SimplifiedTransaction>({
    assetId: '',
    type: 'buy',
    amount: 0,
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSkipStepChange = (skipStep: boolean) => {
    onUpdateStepData({ skipStep });
  };

  const handleBulkImportChange = (bulkImport: boolean) => {
    onUpdateStepData({ bulkImport });
  };

  const handleAddTransaction = () => {
    if (newTransaction.assetId && newTransaction.amount > 0) {
      onAddTransaction(newTransaction);
      setNewTransaction({
        assetId: '',
        type: 'buy',
        amount: 0,
        quantity: 0,
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setShowTransactionForm(false);
    }
  };

  const getAssetName = (assetId: string) => {
    const asset = availableAssets.find(a => ('id' in a ? a.id : a.symbol) === assetId);
    if (!asset) {
      // If no asset definition found, this might be a manually entered asset
      return assetId;
    }
    
    const symbol = 'symbol' in asset ? asset.symbol : assetId;
    const name = 'name' in asset ? asset.name : 'Custom Asset';
    return `${symbol} - ${name}`;
  };

  const getTransactionTypeColor = (type: string) => {
    if (type === 'buy') return 'bg-green-100 text-green-800';
    if (type === 'sell') return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  const hasAssets = availableAssets.length > 0;

  return (
    <div className="space-y-8">
      {/* No Assets Warning */}
      {!hasAssets && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                {t('setupWizard.steps.transactions.noAssets.title')}
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>{t('setupWizard.steps.transactions.noAssets.description')}</p>
                <p className="mt-2"><strong>{t('setupWizard.steps.transactions.noAssets.tip')}</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skip Option */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="skip-transactions"
              type="checkbox"
              checked={stepData.skipStep}
              onChange={(e) => handleSkipStepChange(e.target.checked)}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="skip-transactions" className="font-medium text-gray-700">
              {t('setupWizard.steps.transactions.skipOption.title')}
            </label>
            <p className="text-gray-500">
              {t('setupWizard.steps.transactions.skipOption.description')}
            </p>
          </div>
        </div>
      </div>

      {!stepData.skipStep && hasAssets && (
        <>
          {/* Bulk Import Option */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">
              {t('setupWizard.steps.transactions.howToAdd')}
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="manual-entry"
                  name="transaction-method"
                  type="radio"
                  checked={!stepData.bulkImport}
                  onChange={() => handleBulkImportChange(false)}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="manual-entry" className="ml-3 block text-sm font-medium text-gray-700">
                  {t('setupWizard.steps.transactions.methods.manual')}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="bulk-import"
                  name="transaction-method"
                  type="radio"
                  checked={stepData.bulkImport}
                  onChange={() => handleBulkImportChange(true)}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="bulk-import" className="ml-3 block text-sm font-medium text-gray-700">
                  {t('setupWizard.steps.transactions.methods.bulkImport')}
                </label>
              </div>
            </div>
          </div>

          {stepData.bulkImport ? (
            /* Bulk Import Interface */
            <div className="space-y-4">
              <QuickDataImport
                onFileSelect={onFileSelect || (() => {})}
                acceptedFormats={['.csv', '.json']}
                maxFileSize={10}
              />
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">{t('setupWizard.steps.transactions.importFormat.title')}</h5>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>{t('setupWizard.steps.transactions.importFormat.required')}</strong></p>
                  <p><strong>{t('setupWizard.steps.transactions.importFormat.optional')}</strong></p>
                  <p><strong>{t('setupWizard.steps.transactions.importFormat.dateFormat')}</strong></p>
                </div>
              </div>
            </div>
          ) : (
            /* Manual Transaction Entry */
            <div className="space-y-6">
              {/* Existing Transactions */}
              {stepData.transactions.length > 0 && (
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">{t('setupWizard.steps.transactions.yourTransactions')} ({stepData.transactions.length})</h5>
                  <div className="space-y-3">
                    {stepData.transactions.map((transaction) => (
                      <div key={`${transaction.assetId}-${transaction.date}-${transaction.amount}`} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium text-gray-900">{getAssetName(transaction.assetId)}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getTransactionTypeColor(transaction.type)}`}>
                              {transaction.type.toUpperCase()}
                            </span>
                            <span className="text-gray-600">${transaction.amount.toFixed(2)}</span>
                            {transaction.quantity && (
                              <span className="text-gray-500">× {transaction.quantity}</span>
                            )}
                            <span className="text-gray-500">{new Date(transaction.date).toLocaleDateString()}</span>
                          </div>
                          {transaction.notes && (
                            <p className="text-sm text-gray-500 mt-1">{transaction.notes}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveTransaction(index)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Transaction Form */}
              {!showTransactionForm ? (
                <button
                  type="button"
                  onClick={() => setShowTransactionForm(true)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                >
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="mt-2 block text-sm font-medium text-gray-900">{t('setupWizard.steps.transactions.addTransaction')}</span>
                </button>
              ) : (
                <div className="border border-gray-300 rounded-lg p-6 space-y-4">
                  <h5 className="font-medium text-gray-900">{t('setupWizard.steps.transactions.addNewTransaction')}</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="transaction-asset" className="block text-sm font-medium text-gray-700">{t('setupWizard.steps.transactions.form.asset')}</label>
                      {hasAssets ? (
                        <select
                          id="transaction-asset"
                          value={newTransaction.assetId}
                          onChange={(e) => setNewTransaction({ ...newTransaction, assetId: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="">{t('setupWizard.steps.transactions.form.assetPlaceholder')}</option>
                          {availableAssets.map((asset) => {
                            const id = 'id' in asset ? asset.id : asset.symbol;
                            const display = `${asset.symbol} - ${asset.name}`;
                            return (
                              <option key={id} value={id}>{display}</option>
                            );
                          })}
                        </select>
                      ) : (
                        <input
                          id="transaction-asset"
                          type="text"
                          placeholder={t('setupWizard.steps.transactions.form.assetInputPlaceholder')}
                          value={newTransaction.assetId}
                          onChange={(e) => setNewTransaction({ ...newTransaction, assetId: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      )}
                      {!hasAssets && (
                        <p className="mt-1 text-xs text-gray-500">
                          {t('setupWizard.steps.transactions.form.assetInputHelp')}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="transaction-type" className="block text-sm font-medium text-gray-700">{t('setupWizard.steps.transactions.form.type')}</label>
                      <select
                        id="transaction-type"
                        value={newTransaction.type}
                        onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as 'buy' | 'sell' | 'dividend' })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="buy">{t('setupWizard.steps.transactions.types.buy')}</option>
                        <option value="sell">{t('setupWizard.steps.transactions.types.sell')}</option>
                        <option value="dividend">{t('setupWizard.steps.transactions.types.dividend')}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="transaction-amount" className="block text-sm font-medium text-gray-700">{t('setupWizard.steps.transactions.form.amount')}</label>
                      <input
                        id="transaction-amount"
                        type="number"
                        step="0.01"
                        value={newTransaction.amount || ''}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="transaction-quantity" className="block text-sm font-medium text-gray-700">{t('setupWizard.steps.transactions.form.quantity')}</label>
                      <input
                        id="transaction-quantity"
                        type="number"
                        step="0.01"
                        value={newTransaction.quantity || ''}
                        onChange={(e) => setNewTransaction({ ...newTransaction, quantity: parseFloat(e.target.value) || undefined })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="transaction-date" className="block text-sm font-medium text-gray-700">{t('setupWizard.steps.transactions.form.date')}</label>
                      <input
                        id="transaction-date"
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="transaction-notes" className="block text-sm font-medium text-gray-700">{t('setupWizard.steps.transactions.form.notes')}</label>
                    <textarea
                      id="transaction-notes"
                      value={newTransaction.notes}
                      onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                      rows={2}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowTransactionForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {t('setupWizard.steps.transactions.actions.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddTransaction}
                      disabled={!newTransaction.assetId || newTransaction.amount <= 0}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('setupWizard.steps.transactions.actions.addTransaction')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionsStep;