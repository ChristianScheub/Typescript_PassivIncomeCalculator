import React from 'react';
import { StepDataCollection } from '@/types/domains/setupWizard';

interface CompletionStepProps {
  stepData: StepDataCollection;
  onComplete: () => void;
  isLoading?: boolean;
}

const CompletionStep: React.FC<CompletionStepProps> = ({
  stepData,
  onComplete,
  isLoading = false
}) => {
  const getStepSummary = () => {
    const summary = {
      assets: stepData.assetDefinitions.selectedTemplates.length + stepData.assetDefinitions.customAssets.length,
      transactions: stepData.transactions.transactions.length,
      liabilities: stepData.liabilities.liabilities.length,
      income: stepData.income.incomes.length,
      totalLiabilities: stepData.liabilities.liabilities.reduce((sum, l) => sum + l.amount, 0),
      totalMonthlyIncome: stepData.income.incomes.reduce((sum, i) => sum + i.monthlyAmount, 0)
    };
    return summary;
  };

  const summary = getStepSummary();

  return (
    <div className="space-y-8">
      {/* Completion Header */}
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-medium text-gray-900 mb-4">
          Setup Complete!
        </h3>
        
        <p className="text-gray-600 max-w-2xl mx-auto">
          Great job! You've successfully configured your passive income calculator. 
          Here's a summary of what you've set up.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Assets Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-900">Assets Defined</p>
              <p className="text-2xl font-bold text-blue-600">{summary.assets}</p>
            </div>
          </div>
          {stepData.assetDefinitions.skipStep && (
            <p className="text-xs text-blue-700 mt-2">Step was skipped</p>
          )}
        </div>

        {/* Transactions Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-900">Transactions</p>
              <p className="text-2xl font-bold text-green-600">{summary.transactions}</p>
            </div>
          </div>
          {stepData.transactions.skipStep && (
            <p className="text-xs text-green-700 mt-2">Step was skipped</p>
          )}
        </div>

        {/* Liabilities Summary */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-900">Liabilities</p>
              <p className="text-2xl font-bold text-red-600">
                {summary.liabilities > 0 ? `$${summary.totalLiabilities.toLocaleString()}` : '0'}
              </p>
            </div>
          </div>
          {stepData.liabilities.skipStep && (
            <p className="text-xs text-red-700 mt-2">Step was skipped</p>
          )}
        </div>

        {/* Income Summary */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-900">Monthly Income</p>
              <p className="text-2xl font-bold text-purple-600">
                {summary.income > 0 ? `$${summary.totalMonthlyIncome.toLocaleString()}` : '0'}
              </p>
            </div>
          </div>
          {stepData.income.skipStep && (
            <p className="text-xs text-purple-700 mt-2">Step was skipped</p>
          )}
        </div>
      </div>

      {/* Detailed Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Configuration Summary</h4>
        
        <div className="space-y-4">
          {/* Assets */}
          {summary.assets > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Assets ({summary.assets})</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {stepData.assetDefinitions.selectedTemplates.length > 0 && (
                  <div>
                    <p className="text-gray-600">Selected Templates:</p>
                    <ul className="list-disc list-inside text-gray-800">
                      {stepData.assetDefinitions.selectedTemplates.map(template => (
                        <li key={template.id}>{template.symbol} - {template.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {stepData.assetDefinitions.customAssets.length > 0 && (
                  <div>
                    <p className="text-gray-600">Custom Assets:</p>
                    <ul className="list-disc list-inside text-gray-800">
                      {stepData.assetDefinitions.customAssets.map((asset, index) => (
                        <li key={index}>{asset.symbol} - {asset.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transactions */}
          {summary.transactions > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Transactions ({summary.transactions})</h5>
              <div className="text-sm text-gray-600">
                <p>Your transaction history has been recorded and will be used to calculate your portfolio performance and passive income projections.</p>
              </div>
            </div>
          )}

          {/* Financial Overview */}
          {(summary.income > 0 || summary.liabilities > 0) && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Financial Overview</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {summary.income > 0 && (
                  <div>
                    <p className="text-gray-600">Total Monthly Income:</p>
                    <p className="font-medium text-green-600">${summary.totalMonthlyIncome.toLocaleString()}</p>
                    <p className="text-gray-500">Annual: ${(summary.totalMonthlyIncome * 12).toLocaleString()}</p>
                  </div>
                )}
                {summary.liabilities > 0 && (
                  <div>
                    <p className="text-gray-600">Total Liabilities:</p>
                    <p className="font-medium text-red-600">${summary.totalLiabilities.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-3">What's Next?</h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• Your passive income calculator is now ready to use</p>
          <p>• Visit the dashboard to see your portfolio overview and projections</p>
          <p>• Use the analytics section to dive deeper into your financial data</p>
          <p>• You can always add more assets, transactions, and update your information in the settings</p>
        </div>
      </div>

      {/* Complete Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={onComplete}
          disabled={isLoading}
          className="px-8 py-3 text-base font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving Configuration...
            </>
          ) : (
            <>
              Complete Setup & Go to Dashboard
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CompletionStep;