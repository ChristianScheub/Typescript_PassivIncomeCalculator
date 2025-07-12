import React, { useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { RootState } from '@/store/index';
import { AssetCategoryManagerView } from '@/view/portfolio-hub/assets/AssetCategoryManagerView';
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
} from '@/store/slices/domain';
import Logger from '@/service/shared/logging/Logger/logger';
import { useAsyncOperation } from '@/utils/containerUtils';
import { AssetCategory, AssetCategoryOption, NewAssetCategory, NewAssetCategoryOption, NewAssetCategoryOptionWithCategory, CategoryFormData, CategoryOptionFormData } from '@/types/domains/assets';

// Schema for validating category and option data
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

// Form adapter to bridge React Hook Form with view expectations
const createFormAdapter = <T extends Record<string, any>>(form: UseFormReturn<T>) => ({
  control: form.control,
  handleSubmit: (callback: (data: T) => void) => form.handleSubmit(callback),
  reset: form.reset,
  formState: form.formState,
  watch: form.watch,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: (field: string, value: unknown) => form.setValue(field as any, value as any),
  getValues: form.getValues,
});

interface AssetCategoryContainerProps {
  onBack?: () => void;
}

export const AssetCategoryContainer: React.FC<AssetCategoryContainerProps> = ({ onBack }) => {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useAppDispatch();
  const { executeAsyncOperation } = useAsyncOperation();
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

  const handleAddCategory = (data: NewAssetCategory) => {
    executeAsyncOperation(
      'add category',
      () => dispatch(addAssetCategory(data))
    );
  };

  const handleAddCategoryWithOptions = (
    categoryData: NewAssetCategory, 
    options: NewAssetCategoryOption[]
  ) => {
    executeAsyncOperation(
      'add category',
      async () => {
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
      }
    );
  };

  const handleUpdateCategory = (data: AssetCategory) => {
    executeAsyncOperation(
      'update category',
      () => dispatch(updateAssetCategory(data))
    );
  };

  const handleDeleteCategory = (id: string) => {
    executeAsyncOperation(
      'delete category',
      () => dispatch(deleteAssetCategory(id))
    );
  };

  const handleAddCategoryOption = (data: NewAssetCategoryOptionWithCategory) => {
    executeAsyncOperation(
      'add category option',
      () => dispatch(addAssetCategoryOption(data))
    );
  };

  const handleUpdateCategoryOption = (data: AssetCategoryOption) => {
    executeAsyncOperation(
      'update category option',
      () => dispatch(updateAssetCategoryOption(data))
    );
  };

  const handleDeleteCategoryOption = (id: string) => {
    executeAsyncOperation(
      'delete category option',
      () => dispatch(deleteAssetCategoryOption(id))
    );
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
      categoryForm={createFormAdapter(categoryForm)}
      optionForm={createFormAdapter(optionForm)}
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
