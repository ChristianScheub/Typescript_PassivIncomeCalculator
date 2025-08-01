import React from "react";
import { useTranslation } from "react-i18next";
import { AssetCategory, AssetCategoryOption } from "../../../types/domains/assets/categories";
import { CategoryFormData, OptionFormData } from "../../../types/shared/ui/view-props";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "../../../ui/portfolioHub/dialog/Modal";
import { ActionButtonGroup } from "../../../ui/portfolioHub/ActionButtonGroup";
import { Button } from "../../../ui/shared/Button";
import FloatingBtn, { ButtonAlignment } from "../../../ui/shared/floatingBtn";
import { ViewHeader } from "../../../ui/shared/ViewHeader";
import { FormGrid, RequiredSection, StandardFormWrapper } from "@/ui/portfolioHub";
import { StandardFormField } from "@/ui/portfolioHub/forms";
import { IconButton } from "@/ui/shared";

interface AssetCategoryManagerViewProps {
  categories: AssetCategory[];
  selectedCategoryId: string | null;
  isAddingCategory: boolean;
  isAddingOption: boolean;
  editingCategory: AssetCategory | null;
  editingOption: AssetCategoryOption | null;
  newCategoryOptions: Omit<
    AssetCategoryOption,
    "id" | "createdAt" | "updatedAt" | "categoryId"
  >[];
  categoryForm: {
    control: unknown;
    handleSubmit: (callback: (data: CategoryFormData) => void) => (e?: React.BaseSyntheticEvent) => Promise<void>;
    reset: () => void;
    formState: {
      errors: Record<string, { message?: string }>;
    };
    watch: (field?: string) => string | boolean;
    setValue: (field: string, value: unknown) => void;
    getValues: () => CategoryFormData;
  };
  optionForm: {
    control: unknown;
    handleSubmit: (callback: (data: OptionFormData) => void) => (e?: React.BaseSyntheticEvent) => Promise<void>;
    reset: () => void;
    formState: {
      errors: Record<string, { message?: string }>;
    };
    watch: (field?: string) => string | boolean;
    setValue: (field: string, value: unknown) => void;
    getValues: () => OptionFormData;
  }; 
  onSetSelectedCategoryId: (id: string | null) => void;
  onSetIsAddingCategory: (isAdding: boolean) => void;
  onSetIsAddingOption: (isAdding: boolean) => void;
  onSetEditingCategory: (category: AssetCategory | null) => void;
  onSetEditingOption: (option: AssetCategoryOption | null) => void;
  onCategorySubmit: (data: CategoryFormData) => void;
  onOptionSubmit: (data: OptionFormData) => void;
  onDeleteCategory: (category: AssetCategory) => void;
  onDeleteCategoryOption: (id: string) => void;
  onAddOptionToNewCategory: (optionData: OptionFormData) => void;
  onRemoveOptionFromNewCategory: (index: number) => void;
  getOptionsForCategory: (categoryId: string) => AssetCategoryOption[];
  onBack?: () => void;
}

export const AssetCategoryManagerView: React.FC<
  AssetCategoryManagerViewProps
> = ({
  categories,
  selectedCategoryId,
  isAddingCategory,
  isAddingOption,
  editingCategory,
  editingOption,
  newCategoryOptions,
  categoryForm,
  optionForm,
  onSetSelectedCategoryId,
  onSetIsAddingCategory,
  onSetIsAddingOption,
  onSetEditingCategory,
  onSetEditingOption,
  onCategorySubmit,
  onOptionSubmit,
  onDeleteCategory,
  onDeleteCategoryOption,
  onAddOptionToNewCategory,
  onRemoveOptionFromNewCategory,
  getOptionsForCategory,
  onBack,
}) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ViewHeader
          title={t("categories.title")}
          onBack={onBack}
        />
          
          <div className="mb-6">
            {/* Categories Section */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {category.name}
                      </h3>
                      <ActionButtonGroup
                        size="sm"
                        variant="ghost"
                        onEdit={() => onSetEditingCategory(category)}
                        onDelete={() => onDeleteCategory(category)}
                        className="gap-1"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {getOptionsForCategory(category.id).length}{" "}
                        {t("categories.options")}
                      </span>
                      <Button
                        onClick={() => onSetSelectedCategoryId(category.id)}
                        variant="secondary"
                        size="sm"
                      >
                        {t("categories.manageOptions")}
                      </Button>
                    </div>
                  </div>
                ))}

                {categories.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                    {t("categories.noCategories")}
                  </div>
                )}
              </div>
            </div>

            {/* Options for Selected Category */}
            {selectedCategoryId && (
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t("categories.optionsForCategory", {
                      categoryName: categories.find(
                        (c) => c.id === selectedCategoryId
                      )?.name,
                    })}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onSetSelectedCategoryId(null)}
                      variant="ghost"
                      size="sm"
                    >
                      {t("common.close")}
                    </Button>
                    <Button
                      onClick={() => onSetIsAddingOption(true)}
                      variant="success"
                      size="sm"
                      startIcon={<Plus className="h-4 w-4" />}
                    >
                      {t("categories.addOption")}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {getOptionsForCategory(selectedCategoryId).map((option) => (
                    <div
                      key={option.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {option.name}
                        </span>
                        <ActionButtonGroup
                          size="sm"
                          variant="ghost"
                          onEdit={() => onSetEditingOption(option)}
                          onDelete={() => {
                            if (window.confirm(t("common.deleteConfirm"))) {
                              onDeleteCategoryOption(option.id);
                            }
                          }}
                          className="gap-1"
                        />
                      </div>
                    </div>
                  ))}

                  {getOptionsForCategory(selectedCategoryId).length === 0 && (
                    <div className="col-span-full text-center py-4 text-gray-500 dark:text-gray-400">
                      {t("categories.noOptions")}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Category Form Modal */}
            <Modal
              isOpen={isAddingCategory || !!editingCategory}
              onClose={() => {
                onSetIsAddingCategory(false);
                onSetEditingCategory(null);
                onRemoveOptionFromNewCategory(-1); // Clear all options
                categoryForm.reset();
              }}
            >
              <StandardFormWrapper
                title={
                  editingCategory
                    ? t("categories.editCategory")
                    : t("categories.addCategory")
                }
                onSubmit={categoryForm.handleSubmit(onCategorySubmit)}
              >
                <RequiredSection>
                  <FormGrid>
                    <StandardFormField
                      label={t("categories.categoryName")}
                      name="name"
                      required
                      error={categoryForm.formState.errors.name?.message}
                      value={categoryForm.watch("name")}
                      onChange={(value) => categoryForm.setValue("name", value)}
                      placeholder={t("categories.categoryNamePlaceholder")}
                    />

                    <StandardFormField
                      label={t("categories.isActive")}
                      name="isActive"
                      type="checkbox"
                      value={categoryForm.watch("isActive")}
                      onChange={(value) =>
                        categoryForm.setValue("isActive", value)
                      }
                    />
                  </FormGrid>
                </RequiredSection>

                {/* Options Section for New Categories */}
                {!editingCategory && (
                  <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {t("categories.optionsForCategory")}
                      </h4>
                      <Button
                        type="button"
                        onClick={() => {
                          const optionData = optionForm.getValues();
                          if (optionData.name?.trim()) {
                            onAddOptionToNewCategory(optionData);
                          }
                        }}
                        variant="success"
                        size="sm"
                        startIcon={<Plus className="h-3 w-3" />}
                      >
                        {t("categories.addOption")}
                      </Button>
                    </div>

                    {/* Option Input Form */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                      <StandardFormField
                        label={t("categories.optionName")}
                        name="option-name"
                        value={optionForm.watch("name")}
                        onChange={(value) => optionForm.setValue("name", value)}
                        placeholder={t("categories.optionNamePlaceholder")}
                      />
                    </div>

                    {/* Display Added Options */}
                    {newCategoryOptions.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t("categories.previewOptions")} (
                          {newCategoryOptions.length})
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {newCategoryOptions.map((option, index) => (
                            <div
                              key={`new-option-${option.name}-${index}`}
                              className="flex items-center justify-between bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3"
                            >
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {option.name}
                              </span>
                              <IconButton
                                onClick={() =>
                                  onRemoveOptionFromNewCategory(index)
                                }
                                icon={<Trash2 className="h-3 w-3" />}
                                aria-label="Remove option"
                                variant="ghostDestructive"
                                size="iconSm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </StandardFormWrapper>
            </Modal>

            {/* Category Option Form Modal */}
            <Modal
              isOpen={isAddingOption || !!editingOption}
              onClose={() => {
                onSetIsAddingOption(false);
                onSetEditingOption(null);
                optionForm.reset();
              }}
            >
              <StandardFormWrapper
                title={
                  editingOption
                    ? t("categories.editOption")
                    : t("categories.addOption")
                }
                onSubmit={optionForm.handleSubmit(onOptionSubmit)}
              >
                <RequiredSection>
                  <FormGrid>
                    <StandardFormField
                      label={t("categories.optionName")}
                      name="name"
                      required
                      error={optionForm.formState.errors.name?.message}
                      value={optionForm.watch("name")}
                      onChange={(value) => optionForm.setValue("name", value)}
                      placeholder={t("categories.optionNamePlaceholder")}
                    />

                    <StandardFormField
                      label={t("categories.isActive")}
                      name="isActive"
                      type="checkbox"
                      value={optionForm.watch("isActive")}
                      onChange={(value) =>
                        optionForm.setValue("isActive", value)
                      }
                    />
                  </FormGrid>
                </RequiredSection>
              </StandardFormWrapper>
            </Modal>

            {/* Floating Add Category Button - hidden when any form is open */}
            {!isAddingCategory &&
              !editingCategory &&
              !isAddingOption &&
              !editingOption && (
                <FloatingBtn
                  alignment={ButtonAlignment.RIGHT}
                  icon={Plus}
                  onClick={() => onSetIsAddingCategory(true)}
                  backgroundColor="#2563eb"
                  hoverBackgroundColor="#1d4ed8"
                />
              )}
          </div>
        </div>
      </div>
  );
};
