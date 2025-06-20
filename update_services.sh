#!/bin/bash

# Script to bulk update calculator service imports
WORKSPACE_DIR="/Users/christianscheub/Documents/Develope/PassiveIncomeCalculator/Typescript_PassivIncomeCalculator"

# Find all TypeScript files excluding node_modules, test files, and type definitions
find "$WORKSPACE_DIR/src" -type f \( -name "*.ts" -o -name "*.tsx" \) \
    ! -path "*/node_modules/*" \
    ! -name "*.d.ts" \
    ! -name "*test*" \
    ! -name "*spec*" \
    -exec grep -l "from.*calculatorService" {} \; > calculator_service_files.txt

echo "Files that import calculatorService:"
cat calculator_service_files.txt

# Find files that still import from old analyticsService path
find "$WORKSPACE_DIR/src" -type f \( -name "*.ts" -o -name "*.tsx" \) \
    ! -path "*/node_modules/*" \
    ! -name "*.d.ts" \
    -exec grep -l "from.*analyticsService" {} \; > analytics_service_files.txt

echo -e "\nFiles that import from old analyticsService:"
cat analytics_service_files.txt

echo -e "\nTotal files to update: $(( $(wc -l < calculator_service_files.txt) + $(wc -l < analytics_service_files.txt) ))"
