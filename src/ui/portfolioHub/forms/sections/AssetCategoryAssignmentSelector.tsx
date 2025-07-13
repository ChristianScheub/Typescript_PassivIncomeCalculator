import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetCategory, AssetCategoryOption, AssetCategoryAssignment } from '@/types/domains/assets/categories';
import { Plus, X, Tag } from 'lucide-react';

interface AssetCategoryAssignmentSelectorProps {
  assetDefinitionId?: string;
  categories: AssetCategory[];
  categoryOptions: AssetCategoryOption[];
  currentAssignments: AssetCategoryAssignment[];
  onChange: (assignments: Omit<AssetCategoryAssignment, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
}

export const AssetCategoryAssignmentSelector: React.FC<AssetCategoryAssignmentSelectorProps> = ({
  assetDefinitionId,
  categories,
  categoryOptions,
  currentAssignments,
  onChange
}) => {
  const { t } = useTranslation();
  const [selectedAssignments, setSelectedAssignments] = useState<Omit<AssetCategoryAssignment, 'id' | 'createdAt' | 'updatedAt'>[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Initialize with current assignments
  useEffect(() => {
    if (assetDefinitionId) {
      const assignments = currentAssignments
        .filter(assignment => assignment.assetDefinitionId === assetDefinitionId)
        .map(assignment => {
          const category = categories.find(cat => cat.id === assignment.categoryId);
          const option = categoryOptions.find(opt => opt.id === assignment.categoryOptionId);
          return {
            assetDefinitionId: assignment.assetDefinitionId,
            categoryId: assignment.categoryId,
            categoryOptionId: assignment.categoryOptionId,
            name: option?.name || category?.name || '',
          };
        });
      setSelectedAssignments(assignments);
    }
  }, [assetDefinitionId, currentAssignments, categories, categoryOptions]);

  // Get options for selected category
  const getOptionsForCategory = (categoryId: string) => {
    return categoryOptions.filter(option => 
      option.categoryId === categoryId && option.isActive
    );
  };

  // Get category name
  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || '';
  };

  // Get option details
  const getOptionDetails = (optionId: string) => {
    return categoryOptions.find(opt => opt.id === optionId);
  };

  // Add new assignment
  const handleAddAssignment = (categoryId: string, optionId: string) => {
    if (!assetDefinitionId) return;
    const category = categories.find(cat => cat.id === categoryId);
    const option = categoryOptions.find(opt => opt.id === optionId);
    const newAssignment = {
      assetDefinitionId,
      categoryId,
      categoryOptionId: optionId,
      name: option?.name || category?.name || '',
    };

    // Check if assignment already exists for this category
    const existingIndex = selectedAssignments.findIndex(
      assignment => assignment.categoryId === categoryId
    );

    let updatedAssignments;
    if (existingIndex >= 0) {
      // Replace existing assignment for this category
      updatedAssignments = [...selectedAssignments];
      updatedAssignments[existingIndex] = newAssignment;
    } else {
      // Add new assignment
      updatedAssignments = [...selectedAssignments, newAssignment];
    }

    setSelectedAssignments(updatedAssignments);
    onChange(updatedAssignments);
    setShowAddForm(false);
    setSelectedCategoryId('');
  };

  // Remove assignment
  const handleRemoveAssignment = (categoryId: string) => {
    const updatedAssignments = selectedAssignments.filter(
      assignment => assignment.categoryId !== categoryId
    );
    setSelectedAssignments(updatedAssignments);
    onChange(updatedAssignments);
  };

  // Get available categories (not yet assigned)
  const getAvailableCategories = () => {
    return categories.filter(category => 
      category.isActive && 
      !selectedAssignments.some(assignment => assignment.categoryId === category.id)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('categories.assetCategories')}
        </h4>
        {categories.length > 0 && getAvailableCategories().length > 0 && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="h-3 w-3 mr-1" />
            {t('categories.addAssignment')}
          </button>
        )}
      </div>

      {/* Current Assignments */}
      <div className="space-y-2">
        {selectedAssignments.map(assignment => {
          const option = getOptionDetails(assignment.categoryOptionId);
          return (
            <div
              key={`${assignment.categoryId}-${assignment.categoryOptionId}`}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getCategoryName(assignment.categoryId)}:
                </span>
                <div className="flex items-center gap-1">
                  {option && 'color' in option && typeof (option as { color?: string }).color === 'string' && (
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: (option as { color: string }).color }}
                    />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {option?.name}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveAssignment(assignment.categoryId)}
                className="p-1 text-gray-500 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}

        {selectedAssignments.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            {t('categories.noAssignments')}
          </div>
        )}
      </div>

      {/* Add Assignment Form */}
      {showAddForm && (
        <div className="p-3 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('categories.selectCategory')}
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">{t('categories.selectCategoryPlaceholder')}</option>
                {getAvailableCategories().map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCategoryId && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('categories.selectOption')}
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {getOptionsForCategory(selectedCategoryId).map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleAddAssignment(selectedCategoryId, option.id)}
                      className="flex items-center gap-2 p-2 text-left text-sm border border-gray-200 dark:border-gray-600 rounded hover:bg-white dark:hover:bg-gray-600"
                    >
                      {option && 'color' in option && typeof (option as { color?: string }).color === 'string' && (
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: (option as { color: string }).color }}
                        />
                      )}
                      <span className="text-gray-900 dark:text-gray-100">{option.name}</span>
                      {option && 'description' in option && typeof (option as { description?: string }).description === 'string' && (
                        <span className="text-xs text-gray-500">({(option as { description: string }).description})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedCategoryId('');
                }}
                className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No categories available message */}
      {categories.length === 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          {t('categories.noCategoriesAvailable')}
        </div>
      )}
    </div>
  );
};
