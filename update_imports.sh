#!/bin/bash

# Script to update UI component imports after reorganization
echo "Updating UI component imports..."

# Update common component imports
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/Button'|from '../ui/common/Button'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/Card'|from '../ui/common/Card'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/Modal'|from '../ui/common/Modal'|g" {} \;

# Update feedback component imports
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/LoadingSpinner'|from '../ui/feedback/LoadingSpinner'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/EmptyState'|from '../ui/feedback/EmptyState'|g" {} \;

# Update form component imports
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/FormGrid'|from '../ui/forms/FormGrid'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/MaterialForm'|from '../ui/forms/MaterialForm'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/MonthSelector'|from '../ui/forms/MonthSelector'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/FormContainer'|from '../ui/forms/FormContainer'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/StandardFormWrapper'|from '../ui/forms/StandardFormWrapper'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/OptionalSection'|from '../ui/forms/OptionalSection'|g" {} \;

# Update navigation component imports
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/TabSelector'|from '../ui/navigation/TabSelector'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/LanguageSelector'|from '../ui/navigation/LanguageSelector'|g" {} \;

# Update specialized component imports
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/AssetSpecificSection'|from '../ui/specialized/AssetSpecificSection'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/AssetSpecificFields'|from '../ui/specialized/AssetSpecificFields'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/AssetOptionalSection'|from '../ui/specialized/AssetOptionalSection'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/ExpenseOptionalSection'|from '../ui/specialized/ExpenseOptionalSection'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/CustomScheduleSection'|from '../ui/specialized/CustomScheduleSection'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/DebugSettings'|from '../ui/specialized/DebugSettings'|g" {} \;

# Update layout component imports
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/DataSummaryCard'|from '../ui/layout/DataSummaryCard'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/floatingBtn'|from '../ui/layout/floatingBtn'|g" {} \;

# Update chart component imports - handle both old and new chart structure
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/ChartTooltips'|from '../ui/charts/ChartTooltips'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/CustomBarTooltip'|from '../ui/charts/CustomBarTooltip'|g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s|from '../ui/CustomPieTooltip'|from '../ui/charts/CustomPieTooltip'|g" {} \;

echo "Import updates completed!"
