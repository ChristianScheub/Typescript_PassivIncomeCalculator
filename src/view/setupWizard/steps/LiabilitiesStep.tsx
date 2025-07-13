import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LiabilitiesStepData, SimplifiedLiability } from '@/types/domains/setupWizard';

interface LiabilitiesStepProps {
  stepData: LiabilitiesStepData;
  onUpdateStepData: (data: Partial<LiabilitiesStepData>) => void;
  onAddLiability: (liability: SimplifiedLiability) => void;
  onRemoveLiability: (index: number) => void;
}

const LiabilitiesStep: React.FC<LiabilitiesStepProps> = ({
  stepData,
  onUpdateStepData,
  onAddLiability,
  onRemoveLiability
}) => {
  const { t } = useTranslation();
  const [showLiabilityForm, setShowLiabilityForm] = useState(false);
  const [newLiability, setNewLiability] = useState<SimplifiedLiability>({
    name: '',
    amount: 0,
    interestRate: 0,
    monthlyPayment: 0,
    description: ''
  });

  const handleSkipStepChange = (skipStep: boolean) => {
    onUpdateStepData({ skipStep });
  };

  const handleAddLiability = () => {
    if (newLiability.name && newLiability.amount > 0) {
      onAddLiability(newLiability);
      setNewLiability({
        name: '',
        amount: 0,
        interestRate: 0,
        monthlyPayment: 0,
        description: ''
      });
      setShowLiabilityForm(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Skip Option */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="skip-liabilities"
              type="checkbox"
              checked={stepData.skipStep}
              onChange={(e) => handleSkipStepChange(e.target.checked)}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="skip-liabilities" className="font-medium text-gray-700">
              {t('setupWizard.steps.liabilities.skipOption.title')}
            </label>
            <p className="text-gray-500">
              {t('setupWizard.steps.liabilities.skipOption.description')}
            </p>
          </div>
        </div>
      </div>

      {!stepData.skipStep && (
        <>
          {/* Introduction */}
          <div className="text-center">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              {t('setupWizard.steps.liabilities.title')}
            </h4>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('setupWizard.steps.liabilities.description')}
            </p>
          </div>

          {/* Existing Liabilities */}
          {stepData.liabilities.length > 0 && (
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">{t('setupWizard.steps.liabilities.yourLiabilities')} ({stepData.liabilities.length})</h5>
              <div className="space-y-3">
                {stepData.liabilities.map((liability, index) => (
                  <div key={`${liability.name}-${liability.type}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h6 className="font-medium text-gray-900">{liability.name}</h6>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">{t('setupWizard.steps.liabilities.summary.amount')}</span>
                            <p className="font-medium text-red-600">${liability.amount.toLocaleString()}</p>
                          </div>
                          {liability.interestRate && (
                            <div>
                              <span className="text-gray-500">{t('setupWizard.steps.liabilities.summary.interestRate')}</span>
                              <p className="font-medium">{liability.interestRate}%</p>
                            </div>
                          )}
                          {liability.monthlyPayment && (
                            <div>
                              <span className="text-gray-500">{t('setupWizard.steps.liabilities.summary.monthlyPayment')}</span>
                              <p className="font-medium">${liability.monthlyPayment.toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                        {liability.description && (
                          <p className="text-sm text-gray-600 mt-2">{liability.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveLiability(index)}
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h6 className="font-medium text-red-900">{t('setupWizard.steps.liabilities.totalLiabilities')}</h6>
                    <p className="text-red-800">
                      ${stepData.liabilities.reduce((sum, liability) => sum + liability.amount, 0).toLocaleString()}
                      {stepData.liabilities.some(l => l.monthlyPayment) && (
                        <span className="ml-2">
                          • {t('setupWizard.steps.liabilities.monthlyPayments')}: ${stepData.liabilities.reduce((sum, liability) => sum + (liability.monthlyPayment || 0), 0).toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Liability Form */}
          {!showLiabilityForm ? (
            <button
              type="button"
              onClick={() => setShowLiabilityForm(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
            >
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="mt-2 block text-sm font-medium text-gray-900">{t('setupWizard.steps.liabilities.addLiability')}</span>
            </button>
          ) : (
            <div className="border border-gray-300 rounded-lg p-6 space-y-4">
              <h5 className="font-medium text-gray-900">{t('setupWizard.steps.liabilities.addNewLiability')}</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="liability-name" className="block text-sm font-medium text-gray-700">{t('setupWizard.steps.liabilities.form.name')}</label>
                  <input
                    id="liability-name"
                    type="text"
                    value={newLiability.name}
                    onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })}
                    placeholder={t('setupWizard.steps.liabilities.form.namePlaceholder')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="liability-amount" className="block text-sm font-medium text-gray-700">{t('setupWizard.steps.liabilities.form.totalAmount')}</label>
                  <input
                    id="liability-amount"
                    type="number"
                    step="0.01"
                    value={newLiability.amount || ''}
                    onChange={(e) => setNewLiability({ ...newLiability, amount: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="liability-interest-rate" className="block text-sm font-medium text-gray-700">{t('setupWizard.steps.liabilities.form.interestRate')}</label>
                  <input
                    id="liability-interest-rate"
                    type="number"
                    step="0.01"
                    value={newLiability.interestRate || ''}
                    onChange={(e) => setNewLiability({ ...newLiability, interestRate: parseFloat(e.target.value) || undefined })}
                    placeholder={t('setupWizard.steps.liabilities.form.interestRatePlaceholder')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="liability-monthly-payment" className="block text-sm font-medium text-gray-700">{t('setupWizard.steps.liabilities.form.monthlyPayment')}</label>
                  <input
                    id="liability-monthly-payment"
                    type="number"
                    step="0.01"
                    value={newLiability.monthlyPayment || ''}
                    onChange={(e) => setNewLiability({ ...newLiability, monthlyPayment: parseFloat(e.target.value) || undefined })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="liability-description" className="block text-sm font-medium text-gray-700">{t('setupWizard.steps.liabilities.form.description')}</label>
                <textarea
                  id="liability-description"
                  value={newLiability.description}
                  onChange={(e) => setNewLiability({ ...newLiability, description: e.target.value })}
                  rows={2}
                  placeholder={t('setupWizard.steps.liabilities.form.descriptionPlaceholder')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLiabilityForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t('setupWizard.steps.liabilities.actions.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleAddLiability}
                  disabled={!newLiability.name || newLiability.amount <= 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('setupWizard.steps.liabilities.actions.addLiability')}
                </button>
              </div>
            </div>
          )}

          {/* Common Liability Types */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">{t('setupWizard.steps.liabilities.commonTypes.title')}</h5>
            <div className="text-sm text-blue-800 grid grid-cols-2 md:grid-cols-3 gap-2">
              <div>{t('setupWizard.steps.liabilities.commonTypes.mortgage')}</div>
              <div>{t('setupWizard.steps.liabilities.commonTypes.creditCards')}</div>
              <div>{t('setupWizard.steps.liabilities.commonTypes.studentLoans')}</div>
              <div>{t('setupWizard.steps.liabilities.commonTypes.autoLoans')}</div>
              <div>{t('setupWizard.steps.liabilities.commonTypes.personalLoans')}</div>
              <div>{t('setupWizard.steps.liabilities.commonTypes.lineOfCredit')}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LiabilitiesStep;