import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { AssetCategoryManagerView } from '../view/assets/AssetCategoryManagerView';
import {
  fetchAssetCategories,
  fetchAssetCategoryOptions,
  fetchAssetCategoryAssignments,
  addAssetCategory,
  updateAssetCategory,
  deleteAssetCategory,
  addAssetCategoryOption,
  updateAssetCategoryOption,
  deleteAssetCategoryOption
} from '../store/slices/assetCategoriesSlice';
import { AssetCategory, AssetCategoryOption } from '../types';
import Logger from '../service/Logger/logger';
import { analytics } from '../service/analytics';

// Type aliases for complex union types
type NewAssetCategory = Omit<AssetCategory, 'id' | 'createdAt' | 'updatedAt'>;
type NewAssetCategoryOption = Omit<AssetCategoryOption, 'id' | 'createdAt' | 'updatedAt' | 'categoryId'>;
type NewAssetCategoryOptionWithCategory = Omit<AssetCategoryOption, 'id' | 'createdAt' | 'updatedAt'>;

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  isActive: z.boolean().optional(),
  sortOrder: z.number().min(0).optional(),
});

const categoryOptionSchema = z.object({
  name: z.string().min(1, "Option name is required"),
  isActive: z.boolean().optional(),
  sortOrder: z.number().min(0).optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type CategoryOptionFormData = z.infer<typeof categoryOptionSchema>;

interface AssetCategoryContainerProps {
  onBack?: () => void;
}

export const AssetCategoryContainer: React.FC<AssetCategoryContainerProps> = ({ onBack }) => {
  const dispatch = useAppDispatch();
  const { categories, categoryOptions, status } = useAppSelector(
    state => state.assetCategories
  );

  // State management
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
  const [editingOption, setEditingOption] = useState<AssetCategoryOption | null>(null);
  const [newCategoryOptions, setNewCategoryOptions] = useState<NewAssetCategoryOption[]>([]);

  // Category form
  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      isActive: true,
      sortOrder: 0,
    },
  });

  // Category option form
  const optionForm = useForm<CategoryOptionFormData>({
    resolver: zodResolver(categoryOptionSchema),
    defaultValues: {
      name: "",
      isActive: true,
      sortOrder: 0,
    },
  });

  // Reset forms when editing
  useEffect(() => {
    if (editingCategory) {
      categoryForm.reset({
        name: editingCategory.name,
        isActive: editingCategory.isActive,
        sortOrder: editingCategory.sortOrder || 0,
      });
    }
  }, [editingCategory, categoryForm]);

  useEffect(() => {
    if (editingOption) {
      optionForm.reset({
        name: editingOption.name,
        isActive: editingOption.isActive,
        sortOrder: editingOption.sortOrder || 0,
      });
    }
  }, [editingOption, optionForm]);

  useEffect(() => {
    Logger.info('Fetching asset categories, options, and assignments');
    dispatch(fetchAssetCategories());
    dispatch(fetchAssetCategoryOptions());
    dispatch(fetchAssetCategoryAssignments());
  }, [dispatch]);

  // Form submit handlers
  const handleCategorySubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      handleUpdateCategory({
        ...editingCategory,
        ...data,
        isActive: data.isActive ?? true,
      });
      setEditingCategory(null);
    } else {
      const categoryData = {
        ...data,
        isActive: data.isActive ?? true,
      };

      if (newCategoryOptions.length > 0) {
        handleAddCategoryWithOptions(categoryData, newCategoryOptions);
      } else {
        handleAddCategory(categoryData);
      }

      setNewCategoryOptions([]);
    }
    categoryForm.reset();
    setIsAddingCategory(false);
  };

  const handleOptionSubmit = (data: CategoryOptionFormData) => {
    if (!selectedCategoryId && !editingOption) return;

    if (editingOption) {
      handleUpdateCategoryOption({
        ...editingOption,
        ...data,
        isActive: data.isActive ?? true,
      });
      setEditingOption(null);
    } else {
      handleAddCategoryOption({
        ...data,
        categoryId: selectedCategoryId!,
        isActive: data.isActive ?? true,
      });
    }
    optionForm.reset();
    setIsAddingOption(false);
  };

  // Helper functions
  const handleDeleteCategoryInternal = (category: AssetCategory) => {
    const relatedOptions = categoryOptions.filter(
      (opt: AssetCategoryOption) => opt.categoryId === category.id
    );
    if (relatedOptions.length > 0) {
      if (
        window.confirm(
          `This will also delete ${relatedOptions.length} related options. Are you sure?`
        )
      ) {
        handleDeleteCategory(category.id);
      }
    } else if (window.confirm('Are you sure you want to delete this category?')) {
      handleDeleteCategory(category.id);
    }
  };

  const getOptionsForCategory = (categoryId: string): AssetCategoryOption[] => {
    return categoryOptions.filter((option: AssetCategoryOption) => option.categoryId === categoryId);
  };

  const handleAddOptionToNewCategory = (optionData: CategoryOptionFormData) => {
    if (!optionData.name?.trim()) return;

    const newOption: NewAssetCategoryOption = {
      name: optionData.name,
      isActive: optionData.isActive ?? true,
      sortOrder: optionData.sortOrder || newCategoryOptions.length,
    };

    setNewCategoryOptions((prev) => [...prev, newOption]);
    optionForm.reset();
  };

  const handleRemoveOptionFromNewCategory = (index: number) => {
    setNewCategoryOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCategory = async (data: NewAssetCategory) => {
    try {
      Logger.info('Adding new asset category: ' + JSON.stringify(data));
      analytics.trackEvent('asset_category_add');
      await dispatch(addAssetCategory(data));
    } catch (error) {
      Logger.error('Failed to add asset category: ' + JSON.stringify(error as Error));
    }
  };

  const handleAddCategoryWithOptions = async (
    categoryData: NewAssetCategory, 
    options: NewAssetCategoryOption[]
  ) => {
    try {
      Logger.info('Adding new asset category with options: ' + JSON.stringify({ category: categoryData, optionsCount: options.length }));
      analytics.trackEvent('asset_category_add_with_options', { optionsCount: options.length });
      
      // First add the category
      const result = await dispatch(addAssetCategory(categoryData));
      const categoryId = (result.payload as AssetCategory).id;
      
      // Then add each option
      for (const optionData of options) {
        const optionWithCategoryId = {
          ...optionData,
          categoryId: categoryId
        };
        await dispatch(addAssetCategoryOption(optionWithCategoryId));
      }
      
      Logger.info('Successfully added category with ' + options.length + ' options');
    } catch (error) {
      Logger.error('Failed to add asset category with options: ' + JSON.stringify(error as Error));
    }
  };

  const handleUpdateCategory = async (data: AssetCategory) => {
    try {
      Logger.info('Updating asset category: ' + JSON.stringify({ id: data.id, name: data.name }));
      analytics.trackEvent('asset_category_update', { id: data.id });
      await dispatch(updateAssetCategory(data));
    } catch (error) {
      Logger.error('Failed to update asset category: ' + JSON.stringify(error as Error));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      Logger.info('Deleting asset category: ' + JSON.stringify({ id }));
      analytics.trackEvent('asset_category_delete', { id });
      await dispatch(deleteAssetCategory(id));
    } catch (error) {
      Logger.error('Failed to delete asset category: ' + JSON.stringify(error as Error));
    }
  };

  const handleAddCategoryOption = async (data: NewAssetCategoryOptionWithCategory) => {
    try {
      Logger.info('Adding new category option: ' + JSON.stringify(data));
      analytics.trackEvent('asset_category_option_add');
      await dispatch(addAssetCategoryOption(data));
    } catch (error) {
      Logger.error('Failed to add category option: ' + JSON.stringify(error as Error));
    }
  };

  const handleUpdateCategoryOption = async (data: AssetCategoryOption) => {
    try {
      Logger.info('Updating category option: ' + JSON.stringify({ id: data.id, name: data.name }));
      analytics.trackEvent('asset_category_option_update', { id: data.id });
      await dispatch(updateAssetCategoryOption(data));
    } catch (error) {
      Logger.error('Failed to update category option: ' + JSON.stringify(error as Error));
    }
  };

  const handleDeleteCategoryOption = async (id: string) => {
    try {
      Logger.info('Deleting category option: ' + JSON.stringify({ id }));
      analytics.trackEvent('asset_category_option_delete', { id });
      await dispatch(deleteAssetCategoryOption(id));
    } catch (error) {
      Logger.error('Failed to delete category option: ' + JSON.stringify(error as Error));
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">{/* Loading indicator */}</div>
        </div>
      </div>
    );
  }

  return (
    <AssetCategoryManagerView
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      isAddingCategory={isAddingCategory}
      isAddingOption={isAddingOption}
      editingCategory={editingCategory}
      editingOption={editingOption}
      newCategoryOptions={newCategoryOptions}
      categoryForm={categoryForm}
      optionForm={optionForm}
      onSetSelectedCategoryId={setSelectedCategoryId}
      onSetIsAddingCategory={setIsAddingCategory}
      onSetIsAddingOption={setIsAddingOption}
      onSetEditingCategory={setEditingCategory}
      onSetEditingOption={setEditingOption}
      onCategorySubmit={handleCategorySubmit}
      onOptionSubmit={handleOptionSubmit}
      onDeleteCategory={handleDeleteCategoryInternal}
      onDeleteCategoryOption={handleDeleteCategoryOption}
      onAddOptionToNewCategory={handleAddOptionToNewCategory}
      onRemoveOptionFromNewCategory={handleRemoveOptionFromNewCategory}
      getOptionsForCategory={getOptionsForCategory}
      onBack={onBack}
    />
  );
};
