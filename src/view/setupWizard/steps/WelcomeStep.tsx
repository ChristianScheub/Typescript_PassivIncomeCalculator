import React from 'react';
import { useTranslation } from 'react-i18next';
import QuickDataImport from '@ui/setupWizard/QuickDataImport';
import { WelcomeStepData, ImportValidationResult } from '@/types/domains/setupWizard';

interface WelcomeStepProps {
  stepData: WelcomeStepData;
  onUpdateStepData: (data: Partial<WelcomeStepData>) => void;
  onFileSelect: (file: File, type: 'csv' | 'json') => void;
  onValidationResult?: (result: ImportValidationResult) => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({
  stepData,
  onUpdateStepData,
  onFileSelect,
  onValidationResult
}) => {
  const { t } = useTranslation();
  
  const handleSkipWizardChange = (skipWizard: boolean) => {
    onUpdateStepData({ skipWizard });
  };

  const handleImportDataChange = (importData: boolean) => {
    onUpdateStepData({ importData });
    if (!importData) {
      onUpdateStepData({ importFile: undefined, importType: undefined });
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
          <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('setupWizard.welcome.title')}
        </h3>
        
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('setupWizard.welcome.description')}
        </p>
      </div>

      {/* Skip Option */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="skip-wizard"
              type="checkbox"
              checked={stepData.skipWizard}
              onChange={(e) => handleSkipWizardChange(e.target.checked)}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="skip-wizard" className="font-medium text-gray-700">
              {t('setupWizard.welcome.skip.title')}
            </label>
            <p className="text-gray-500">
              {t('setupWizard.welcome.skip.description')}
            </p>
          </div>
        </div>
      </div>

      {!stepData.skipWizard && (
        <>
          {/* Data Import Option */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">
              {t('setupWizard.welcome.import.question')}
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="import-no"
                  name="import-data"
                  type="radio"
                  checked={!stepData.importData}
                  onChange={() => handleImportDataChange(false)}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="import-no" className="ml-3 block text-sm font-medium text-gray-700">
                  {t('setupWizard.welcome.import.no')}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="import-yes"
                  name="import-data"
                  type="radio"
                  checked={stepData.importData}
                  onChange={() => handleImportDataChange(true)}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="import-yes" className="ml-3 block text-sm font-medium text-gray-700">
                  {t('setupWizard.welcome.import.yes')}
                </label>
              </div>
            </div>
          </div>

          {/* File Import Interface */}
          {stepData.importData && (
            <div className="space-y-4">
              <QuickDataImport
                onFileSelect={onFileSelect}
                onValidationResult={onValidationResult}
                acceptedFormats={['.csv', '.json']}
                maxFileSize={10}
              />
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">{t('setupWizard.welcome.import.guidelines.title')}</h5>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>{t('setupWizard.welcome.import.guidelines.csvFormat')}</strong> {t('setupWizard.welcome.import.guidelines.csvDescription')}</p>
                  <p><strong>{t('setupWizard.welcome.import.guidelines.jsonFormat')}</strong> {t('setupWizard.welcome.import.guidelines.jsonDescription')}</p>
                  <p><strong>{t('setupWizard.welcome.import.guidelines.fileSize')}</strong> {t('setupWizard.welcome.import.guidelines.fileSizeDescription')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Getting Started Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h5 className="text-sm font-medium text-green-800">
                  {t('setupWizard.welcome.nextSteps.title')}
                </h5>
                <div className="mt-2 text-sm text-green-700">
                  <p>{t('setupWizard.welcome.nextSteps.description')}</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>{t('setupWizard.welcome.nextSteps.step1')}</li>
                    <li>{t('setupWizard.welcome.nextSteps.step2')}</li>
                    <li>{t('setupWizard.welcome.nextSteps.step3')}</li>
                    <li>{t('setupWizard.welcome.nextSteps.step4')}</li>
                  </ul>
                  <p className="mt-3">{t('setupWizard.welcome.nextSteps.note')}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WelcomeStep;