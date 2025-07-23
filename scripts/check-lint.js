#!/usr/bin/env node

/**
 * Script to check if lint issues meet strict requirements:
 * - 0 errors allowed
 * - Maximum 5 warnings allowed
 */

import { execSync } from 'child_process';

const MAX_LINT_ERRORS = 0;
const MAX_LINT_WARNINGS = 0;

// Run ESLint and capture output regardless of exit code
let output = '';
try {
  output = execSync('npm run lint', { encoding: 'utf8', stdio: 'pipe' });
} catch (error) {
  output = error.stdout || error.stderr || '';
}

// Parse the ESLint output to count issues
const problemsMatch = output.match(/✖ (\d+) problems? \((\d+) errors?, (\d+) warnings?\)/);

if (problemsMatch) {
  const totalProblems = parseInt(problemsMatch[1], 10);
  const errors = parseInt(problemsMatch[2], 10);
  const warnings = parseInt(problemsMatch[3], 10);
  
  console.log('Lint output:', output);
  console.log(`\n📊 Lint Summary:`);
  console.log(`   Total issues: ${totalProblems}`);
  console.log(`   Errors: ${errors} (max allowed: ${MAX_LINT_ERRORS})`);
  console.log(`   Warnings: ${warnings} (max allowed: ${MAX_LINT_WARNINGS})`);
  
  const errorsExceeded = errors > MAX_LINT_ERRORS;
  const warningsExceeded = warnings > MAX_LINT_WARNINGS;
  
  if (errorsExceeded || warningsExceeded) {
    console.log(`\n❌ Build blocked:`);
    if (errorsExceeded) {
      console.log(`   - ${errors} errors found (${MAX_LINT_ERRORS} allowed)`);
    }
    if (warningsExceeded) {
      console.log(`   - ${warnings} warnings found (${MAX_LINT_WARNINGS} allowed)`);
    }
    console.log(`   Please fix lint issues before building.`);
    process.exit(1);
  } else {
    console.log(`\n✅ Lint check passed: ${errors} errors, ${warnings} warnings (within limits)`);
    process.exit(0);
  }
} else if (output.includes('No lint issues found') || output.trim() === '' || !output.includes('✖')) {
  console.log('✅ No lint issues found!');
  process.exit(0);
} else {
  console.log('\n❌ Could not parse lint output, assuming issues exist');
  console.log('Raw output:', output);
  process.exit(1);
}