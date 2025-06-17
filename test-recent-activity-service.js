// Test script for recentActivityService
import recentActivityService from '../src/service/recentActivityService';

console.log('Testing recentActivityService...');

// Test 1: Add analytics activity
console.log('\n1. Adding analytics activity...');
recentActivityService.addAnalyticsActivity('distributions', 'assets');

// Test 2: Add portfolio activity  
console.log('\n2. Adding portfolio activity...');
recentActivityService.addPortfolioActivity('assets', 'portfolio');

// Test 3: Add transaction activity
console.log('\n3. Adding transaction activity...');
recentActivityService.addTransactionActivity('asset', 'transactions.asset.purchase', 'transactions.asset.purchase.subtitle', 'asset-123', 1500, 'USD');

// Test 4: Get recent activities
console.log('\n4. Getting recent activities...');
const recentActivities = recentActivityService.getRecentActivities(5);
console.log('Recent activities:', recentActivities);

// Test 5: Get activities by type
console.log('\n5. Getting analytics activities...');
const analyticsActivities = recentActivityService.getActivitiesByType('analytics', 3);
console.log('Analytics activities:', analyticsActivities);

console.log('\nTest completed successfully!');
