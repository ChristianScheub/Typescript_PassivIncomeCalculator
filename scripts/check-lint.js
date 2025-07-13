#!/usr/bin/env node

/**
 * Script to check if lint issues are below the threshold (40 issues)
 * This script runs ESLint and counts the total issues, failing if >= 40
 */

import { execSync } from 'child_process';

const MAX_LINT_ISSUES = 125;

try {
  // Run ESLint and capture output
  execSync('npm run lint', { encoding: 'utf8', stdio: 'pipe' });
  console.log('✅ No lint issues found!');
  process.exit(0);
} catch (error) {
  const output = error.stdout || error.stderr || '';
  console.log('Lint output:', output);
  
  // Parse the ESLint output to count issues
  const problemsMatch = output.match(/✖ (\d+) problems? \((\d+) errors?, (\d+) warnings?\)/);
  
  if (problemsMatch) {
    const totalProblems = parseInt(problemsMatch[1], 10);
    const errors = parseInt(problemsMatch[2], 10);
    const warnings = parseInt(problemsMatch[3], 10);
    
    console.log(`\n📊 Lint Summary:`);
    console.log(`   Total issues: ${totalProblems}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Warnings: ${warnings}`);
    console.log(`   Maximum allowed: ${MAX_LINT_ISSUES}`);
    
    if (totalProblems >= MAX_LINT_ISSUES) {
      console.log(`\n❌ Build blocked: ${totalProblems} lint issues found (>= ${MAX_LINT_ISSUES})`);
      console.log(`   Please fix lint issues before building.`);
      process.exit(1);
    } else {
      console.log(`\n✅ Lint check passed: ${totalProblems} issues (< ${MAX_LINT_ISSUES})`);
      process.exit(0);
    }
  } else {
    console.log('\n❌ Could not parse lint output, assuming issues exist');
    process.exit(1);
  }
}