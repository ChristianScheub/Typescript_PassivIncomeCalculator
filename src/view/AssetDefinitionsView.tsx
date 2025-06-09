import React from 'react';
import { useTranslation } from 'react-i18next';
import { AssetDefinition } from '../types';
import { AssetDefinitionForm } from '../ui/forms/AssetDefinitionForm';
import { useDeviceCheck } from '../service/helper/useDeviceCheck';
import { 
  Plus, 
  Edit,
  Trash2,
  Wallet
} from 'lucide-react';

interface AssetDefinitionsViewProps {
  assetDefinitions: AssetDefinition[];
  status: string;
  isAddingDefinition: boolean;
  editingDefinition: AssetDefinition | null;
  getAssetTypeIcon: (type: string) => React.ReactNode;
  onAddDefinition: (data: Omit<AssetDefinition, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateDefinition: (data: AssetDefinition) => void;
  onDeleteDefinition: (id: string) => void;
  onSetIsAddingDefinition: (isAdding: boolean) => void;
  onSetEditingDefinition: (definition: AssetDefinition | null) => void;
  onBack?: () => void;
}

export const AssetDefinitionsView: React.FC<AssetDefinitionsViewProps> = ({
  assetDefinitions,
  status,
  isAddingDefinition,
  editingDefinition,
  getAssetTypeIcon,
  onAddDefinition,
  onUpdateDefinition,
  onDeleteDefinition,
  onSetIsAddingDefinition,
  onSetEditingDefinition,
  onBack
}) => {
  const { t } = useTranslation();
  const isDesktop = useDeviceCheck();

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {onBack && (
            <button 
              onClick={onBack}
              className="mr-4 flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              ← {t('common.back')}
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('assetDefinitions.title')}
            </h1>
            {isDesktop && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('assetDefinitions.subtitle')}
              </p>
            )}
          </div>
        </div>
        <button 
          onClick={() => onSetIsAddingDefinition(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className={`h-4 w-4 ${isDesktop ? 'mr-2' : ''}`} />
          {isDesktop && (
            <span>
              {t('assetDefinitions.addDefinition')}
            </span>
          )}
        </button>
      </div>

      {/* Asset Definitions List */}
      {assetDefinitions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assetDefinitions.map(definition => (
            <div key={definition.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all duration-300">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {getAssetTypeIcon(definition.type)}
                    <div className="ml-3">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{definition.fullName}</h3>
                      {definition.ticker && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{definition.ticker}</p>
                      )}
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                    {t(`assets.types.${definition.type}`)}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {definition.sector && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.sector')}:</span>
                      <span className="text-gray-900 dark:text-gray-100">{definition.sector}</span>
                    </div>
                  )}
                  
                  {definition.country && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.country')}:</span>
                      <span className="text-gray-900 dark:text-gray-100">{definition.country}</span>
                    </div>
                  )}

                  {definition.currency && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.currency')}:</span>
                      <span className="text-gray-900 dark:text-gray-100">{definition.currency}</span>
                    </div>
                  )}

                  {definition.currentPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.currentPrice')}:</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: definition.currency || 'EUR'
                        }).format(definition.currentPrice)}
                      </span>
                    </div>
                  )}

                  {definition.dividendInfo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.dividend')}:</span>
                      <span className="text-green-600 dark:text-green-400">
                        {definition.dividendInfo.amount} ({t(`paymentFrequency.${definition.dividendInfo.frequency}`)})
                      </span>
                    </div>
                  )}

                  {definition.rentalInfo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.rent')}:</span>
                      <span className="text-green-600 dark:text-green-400">
                        {definition.rentalInfo.baseRent} ({t(`paymentFrequency.${definition.rentalInfo.frequency}`)})
                      </span>
                    </div>
                  )}

                  {definition.bondInfo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.interestRate')}:</span>
                      <span className="text-green-600 dark:text-green-400">
                        {definition.bondInfo.interestRate}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 p-3 flex justify-end gap-2">
                <button 
                  onClick={() => onSetEditingDefinition(definition)}
                  className="flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Edit size={14} className="mr-1" />
                  {t('common.edit')}
                </button>
                <button 
                  onClick={() => onDeleteDefinition(definition.id)}
                  className="flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  <Trash2 size={14} className="mr-1" />
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Wallet className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {t('assetDefinitions.noDefinitions')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('assetDefinitions.noDefinitionsDesc')}
          </p>
          <button 
            onClick={() => onSetIsAddingDefinition(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className={`h-4 w-4 ${isDesktop ? 'mr-2' : ''}`} />
            {isDesktop && (
              <span>
                {t('assetDefinitions.addDefinition')}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AssetDefinitionForm
        isOpen={isAddingDefinition || !!editingDefinition}
        onClose={() => {
          onSetIsAddingDefinition(false);
          onSetEditingDefinition(null);
        }}
        onSubmit={(data) => {
          if (editingDefinition) {
            // For updates, merge the form data with the existing definition's metadata
            onUpdateDefinition({
              ...editingDefinition,
              ...data
            });
          } else {
            // For new definitions, just pass the form data
            onAddDefinition(data);
          }
        }}
        editingDefinition={editingDefinition}
      />
    </div>
  );
};
