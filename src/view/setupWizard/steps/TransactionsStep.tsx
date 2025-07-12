import React, { useState } from 'react';
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
    if (!asset) return assetId;
    
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                No Assets Defined
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You need to define assets before adding transactions. Go back to the previous step to add some assets first.</p>
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
              Skip transactions for now
            </label>
            <p className="text-gray-500">
              You can add transaction history later from the portfolio section.
            </p>
          </div>
        </div>
      </div>

      {!stepData.skipStep && hasAssets && (
        <>
          {/* Bulk Import Option */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">
              How would you like to add transactions?
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
                  Add transactions manually
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
                  Import from file (CSV/JSON)
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
                <h5 className="font-medium text-blue-900 mb-2">Transaction Import Format</h5>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Required columns:</strong> asset_symbol, type (buy/sell/dividend), amount, date</p>
                  <p><strong>Optional columns:</strong> quantity, notes</p>
                  <p><strong>Date format:</strong> YYYY-MM-DD (e.g., 2024-01-15)</p>
                </div>
              </div>
            </div>
          ) : (
            /* Manual Transaction Entry */
            <div className="space-y-6">
              {/* Existing Transactions */}
              {stepData.transactions.length > 0 && (
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">Your Transactions ({stepData.transactions.length})</h5>
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
                  <span className="mt-2 block text-sm font-medium text-gray-900">Add Transaction</span>
                </button>
              ) : (
                <div className="border border-gray-300 rounded-lg p-6 space-y-4">
                  <h5 className="font-medium text-gray-900">Add New Transaction</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="transaction-asset" className="block text-sm font-medium text-gray-700">Asset</label>
                      <select
                        id="transaction-asset"
                        value={newTransaction.assetId}
                        onChange={(e) => setNewTransaction({ ...newTransaction, assetId: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select an asset</option>
                        {availableAssets.map((asset) => {
                          const id = 'id' in asset ? asset.id : asset.symbol;
                          const display = `${asset.symbol} - ${asset.name}`;
                          return (
                            <option key={id} value={id}>{display}</option>
                          );
                        })}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="transaction-type" className="block text-sm font-medium text-gray-700">Type</label>
                      <select
                        id="transaction-type"
                        value={newTransaction.type}
                        onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as 'buy' | 'sell' | 'dividend' })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="buy">Buy</option>
                        <option value="sell">Sell</option>
                        <option value="dividend">Dividend</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="transaction-amount" className="block text-sm font-medium text-gray-700">Amount ($)</label>
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
                      <label htmlFor="transaction-quantity" className="block text-sm font-medium text-gray-700">Quantity (Optional)</label>
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
                      <label htmlFor="transaction-date" className="block text-sm font-medium text-gray-700">Date</label>
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
                    <label htmlFor="transaction-notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
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
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddTransaction}
                      disabled={!newTransaction.assetId || newTransaction.amount <= 0}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Transaction
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