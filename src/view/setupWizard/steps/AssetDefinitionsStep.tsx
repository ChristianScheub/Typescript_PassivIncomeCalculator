import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetDefinitionsStepData, AssetTemplate, CustomAssetDefinition } from '@/types/domains/setupWizard';

interface AssetDefinitionsStepProps {
  stepData: AssetDefinitionsStepData;
  availableTemplates: AssetTemplate[];
  popularTemplates: AssetTemplate[];
  onUpdateStepData: (data: Partial<AssetDefinitionsStepData>) => void;
  onAddTemplate: (template: AssetTemplate) => void;
  onRemoveTemplate: (templateId: string) => void;
  onAddCustomAsset: (asset: CustomAssetDefinition) => void;
  onRemoveCustomAsset: (index: number) => void;
}

const AssetDefinitionsStep: React.FC<AssetDefinitionsStepProps> = ({
  stepData,
  availableTemplates,
  popularTemplates,
  onUpdateStepData,
  onAddTemplate,
  onRemoveTemplate,
  onAddCustomAsset,
  onRemoveCustomAsset
}) => {
  const { t } = useTranslation();
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [newCustomAsset, setNewCustomAsset] = useState<CustomAssetDefinition>({
    name: '',
    symbol: '',
    type: 'stock',
    category: '',
    description: ''
  });
  const [showCustomAssetForm, setShowCustomAssetForm] = useState(false);

  const handleSkipStepChange = (skipStep: boolean) => {
    onUpdateStepData({ skipStep });
  };

  const handleAddCustomAsset = () => {
    if (newCustomAsset.name && newCustomAsset.symbol) {
      onAddCustomAsset(newCustomAsset);
      setNewCustomAsset({
        name: '',
        symbol: '',
        type: 'stock',
        category: '',
        description: ''
      });
      setShowCustomAssetForm(false);
    }
  };

  const templatesDisplay = showAllTemplates ? availableTemplates : popularTemplates;
  const selectedTemplateIds = stepData.selectedTemplates.map(t => t.id);

  return (
    <div className="space-y-8">
      {/* Skip Option */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="skip-assets"
              type="checkbox"
              checked={stepData.skipStep}
              onChange={(e) => handleSkipStepChange(e.target.checked)}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="skip-assets" className="font-medium text-gray-700">
              {t('setupWizard.steps.assetDefinitions.skipOption.title')}
            </label>
            <p className="text-gray-500">
              {t('setupWizard.steps.assetDefinitions.skipOption.description')}
            </p>
          </div>
        </div>
      </div>

      {!stepData.skipStep && (
        <>
          {/* Asset Templates */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                {t('setupWizard.steps.assetDefinitions.popularAssets.title')}
              </h4>
              <p className="text-gray-600 mb-6">
                {t('setupWizard.steps.assetDefinitions.popularAssets.description')}
              </p>
            </div>

            {/* Selected Assets Summary */}
            {stepData.selectedTemplates.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">
                  {t('setupWizard.steps.assetDefinitions.selectedAssets.title')} ({stepData.selectedTemplates.length})
                </h5>
                <div className="flex flex-wrap gap-2">
                  {stepData.selectedTemplates.map((template) => (
                    <span
                      key={template.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {template.symbol} - {template.name}
                      <button
                        type="button"
                        onClick={() => onRemoveTemplate(template.id)}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatesDisplay.map((template) => {
                const isSelected = selectedTemplateIds.includes(template.id);
                return (
                  <div
                    key={template.id}
                    className={`
                      border rounded-lg p-4 cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => {
                      if (isSelected) {
                        onRemoveTemplate(template.id);
                      } else {
                        onAddTemplate(template);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{template.symbol}</h5>
                        <p className="text-sm text-gray-600 mt-1">{template.name}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {template.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">{template.category}</span>
                        </div>
                        {template.description && (
                          <p className="text-xs text-gray-500 mt-2">{template.description}</p>
                        )}
                      </div>
                      <div className="ml-2">
                        {isSelected ? (
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show More/Less Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowAllTemplates(!showAllTemplates)}
                className="text-blue-600 hover:text-blue-500 font-medium text-sm"
              >
                {showAllTemplates ? t('setupWizard.steps.assetDefinitions.showLess') : t('setupWizard.steps.assetDefinitions.showMore', { count: availableTemplates.length })}
              </button>
            </div>
          </div>

          {/* Custom Assets */}
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                {t('setupWizard.steps.assetDefinitions.customAssets.title')}
              </h4>
              <p className="text-gray-600 mb-6">
                {t('setupWizard.steps.assetDefinitions.customAssets.description')}
              </p>

              {/* Custom Assets List */}
              {stepData.customAssets.length > 0 && (
                <div className="space-y-3 mb-6">
                  {stepData.customAssets.map((asset) => (
                    <div key={`${asset.symbol}-${asset.name}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900">{asset.symbol} - {asset.name}</h5>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{asset.type.toUpperCase()}</span>
                          <span className="text-xs text-gray-500">{asset.category}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveCustomAsset(index)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Custom Asset Button/Form */}
              {!showCustomAssetForm ? (
                <button
                  type="button"
                  onClick={() => setShowCustomAssetForm(true)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                >
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="mt-2 block text-sm font-medium text-gray-900">{t('setupWizard.steps.assetDefinitions.customAssets.addButton')}</span>
                </button>
              ) : (
                <div className="border border-gray-300 rounded-lg p-6 space-y-4">
                  <h5 className="font-medium text-gray-900">{t('setupWizard.steps.assetDefinitions.customAssets.addButton')}</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="asset-name" className="block text-sm font-medium text-gray-700">{t('setupWizard.steps.assetDefinitions.customAssets.form.name')}</label>
                      <input
                        id="asset-name"
                        type="text"
                        value={newCustomAsset.name}
                        onChange={(e) => setNewCustomAsset({ ...newCustomAsset, name: e.target.value })}
                        placeholder={t('setupWizard.steps.assetDefinitions.customAssets.form.namePlaceholder')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="asset-symbol" className="block text-sm font-medium text-gray-700">{t('setupWizard.steps.assetDefinitions.customAssets.form.symbol')}</label>
                      <input
                        id="asset-symbol"
                        type="text"
                        value={newCustomAsset.symbol}
                        onChange={(e) => setNewCustomAsset({ ...newCustomAsset, symbol: e.target.value.toUpperCase() })}
                        placeholder={t('setupWizard.steps.assetDefinitions.customAssets.form.symbolPlaceholder')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="asset-type" className="block text-sm font-medium text-gray-700">{t('setupWizard.steps.assetDefinitions.customAssets.form.type')}</label>
                      <select
                        id="asset-type"
                        value={newCustomAsset.type}
                        onChange={(e) => setNewCustomAsset({ ...newCustomAsset, type: e.target.value as 'stock' | 'etf' | 'bond' | 'crypto' | 'other' })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="stock">{t('setupWizard.steps.assetDefinitions.customAssets.types.stock')}</option>
                        <option value="etf">{t('setupWizard.steps.assetDefinitions.customAssets.types.etf')}</option>
                        <option value="bond">{t('setupWizard.steps.assetDefinitions.customAssets.types.bond')}</option>
                        <option value="crypto">{t('setupWizard.steps.assetDefinitions.customAssets.types.crypto')}</option>
                        <option value="other">{t('setupWizard.steps.assetDefinitions.customAssets.types.other')}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="asset-category" className="block text-sm font-medium text-gray-700">{t('setupWizard.steps.assetDefinitions.customAssets.form.category')}</label>
                      <input
                        id="asset-category"
                        type="text"
                        value={newCustomAsset.category}
                        onChange={(e) => setNewCustomAsset({ ...newCustomAsset, category: e.target.value })}
                        placeholder={t('setupWizard.steps.assetDefinitions.customAssets.form.categoryPlaceholder')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="asset-description" className="block text-sm font-medium text-gray-700">{t('setupWizard.steps.assetDefinitions.customAssets.form.description')}</label>
                    <textarea
                      id="asset-description"
                      value={newCustomAsset.description}
                      onChange={(e) => setNewCustomAsset({ ...newCustomAsset, description: e.target.value })}
                      rows={2}
                      placeholder={t('setupWizard.steps.assetDefinitions.customAssets.form.descriptionPlaceholder')}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCustomAssetForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {t('setupWizard.steps.assetDefinitions.customAssets.actions.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomAsset}
                      disabled={!newCustomAsset.name || !newCustomAsset.symbol}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('setupWizard.steps.assetDefinitions.customAssets.actions.addAsset')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AssetDefinitionsStep;