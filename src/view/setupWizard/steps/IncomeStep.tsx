import React, { useState } from 'react';
import { IncomeStepData, SimplifiedIncome } from '@/types/domains/setupWizard';

interface IncomeStepProps {
  stepData: IncomeStepData;
  onUpdateStepData: (data: Partial<IncomeStepData>) => void;
  onAddIncome: (income: SimplifiedIncome) => void;
  onRemoveIncome: (index: number) => void;
}

const IncomeStep: React.FC<IncomeStepProps> = ({
  stepData,
  onUpdateStepData,
  onAddIncome,
  onRemoveIncome
}) => {
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [newIncome, setNewIncome] = useState<SimplifiedIncome>({
    name: '',
    monthlyAmount: 0,
    type: 'salary',
    description: ''
  });

  const handleSkipStepChange = (skipStep: boolean) => {
    onUpdateStepData({ skipStep });
  };

  const handleAddIncome = () => {
    if (newIncome.name && newIncome.monthlyAmount > 0) {
      onAddIncome(newIncome);
      setNewIncome({
        name: '',
        monthlyAmount: 0,
        type: 'salary',
        description: ''
      });
      setShowIncomeForm(false);
    }
  };

  const getIncomeTypeColor = (type: string) => {
    switch (type) {
      case 'salary': return 'bg-blue-100 text-blue-800';
      case 'freelance': return 'bg-purple-100 text-purple-800';
      case 'passive': return 'bg-green-100 text-green-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Skip Option */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="skip-income"
              type="checkbox"
              checked={stepData.skipStep}
              onChange={(e) => handleSkipStepChange(e.target.checked)}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="skip-income" className="font-medium text-gray-700">
              Skip income tracking for now
            </label>
            <p className="text-gray-500">
              This step is optional. You can add income source information later.
            </p>
          </div>
        </div>
      </div>

      {!stepData.skipStep && (
        <>
          {/* Introduction */}
          <div className="text-center">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Track Your Income Sources
            </h4>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Add your various income sources to understand your cash flow. 
              This includes salary, freelance work, passive income from investments, and other sources.
            </p>
          </div>

          {/* Existing Income Sources */}
          {stepData.incomes.length > 0 && (
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">Your Income Sources ({stepData.incomes.length})</h5>
              <div className="space-y-3">
                {stepData.incomes.map((income, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h6 className="font-medium text-gray-900">{income.name}</h6>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getIncomeTypeColor(income.type)}`}>
                            {income.type.charAt(0).toUpperCase() + income.type.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Monthly Amount:</span>
                            <p className="font-medium text-green-600">${income.monthlyAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Annual Amount:</span>
                            <p className="font-medium">${(income.monthlyAmount * 12).toLocaleString()}</p>
                          </div>
                        </div>
                        {income.description && (
                          <p className="text-sm text-gray-600 mt-2">{income.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveIncome(index)}
                        className="text-red-400 hover:text-red-600 ml-4"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h6 className="font-medium text-green-900">Total Monthly Income</h6>
                    <p className="text-green-800">
                      ${stepData.incomes.reduce((sum, income) => sum + income.monthlyAmount, 0).toLocaleString()} / month
                      <span className="ml-2">
                        • ${(stepData.incomes.reduce((sum, income) => sum + income.monthlyAmount, 0) * 12).toLocaleString()} / year
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Income Form */}
          {!showIncomeForm ? (
            <button
              type="button"
              onClick={() => setShowIncomeForm(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
            >
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="mt-2 block text-sm font-medium text-gray-900">Add Income Source</span>
            </button>
          ) : (
            <div className="border border-gray-300 rounded-lg p-6 space-y-4">
              <h5 className="font-medium text-gray-900">Add New Income Source</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Source Name *</label>
                  <input
                    type="text"
                    value={newIncome.name}
                    onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })}
                    placeholder="e.g. Main Job, Freelance Client, Rental Property"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Income Type *</label>
                  <select
                    value={newIncome.type}
                    onChange={(e) => setNewIncome({ ...newIncome, type: e.target.value as 'salary' | 'freelance' | 'passive' | 'other' })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="salary">Salary/Wages</option>
                    <option value="freelance">Freelance/Contract</option>
                    <option value="passive">Passive Income</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monthly Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newIncome.monthlyAmount || ''}
                    onChange={(e) => setNewIncome({ ...newIncome, monthlyAmount: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Annual Amount (calculated)</label>
                  <input
                    type="text"
                    value={`$${(newIncome.monthlyAmount * 12).toLocaleString()}`}
                    disabled
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  value={newIncome.description}
                  onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                  rows={2}
                  placeholder="Additional details about this income source"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowIncomeForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddIncome}
                  disabled={!newIncome.name || newIncome.monthlyAmount <= 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Income Source
                </button>
              </div>
            </div>
          )}

          {/* Income Type Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">Income Type Guidelines</h5>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Salary/Wages:</strong> Regular employment income, bonuses, commissions</p>
              <p><strong>Freelance/Contract:</strong> Independent contractor work, consulting fees</p>
              <p><strong>Passive Income:</strong> Dividends, rental income, royalties, interest</p>
              <p><strong>Other:</strong> Government benefits, gifts, irregular income</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IncomeStep;