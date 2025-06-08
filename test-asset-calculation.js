// Quick test to verify asset income calculations are working
console.log('Testing Asset Income Calculations');

// Test Asset with dividend info
const testAsset = {
  id: 'test-123',
  name: 'Test Stock (MSFT)',
  type: 'stock',
  value: 5000,
  currentQuantity: 10,
  purchaseQuantity: 10,
  purchasePrice: 500,
  currentPrice: 500,
  dividendInfo: {
    frequency: 'quarterly',
    amount: 12.5, // per share annual dividend
    months: [3, 6, 9, 12] // quarters
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  purchaseDate: new Date().toISOString()
};

console.log('Test Asset:', JSON.stringify(testAsset, null, 2));

// Expected calculation:
// Annual dividend per share: 12.5
// Total shares: 10
// Total annual dividend: 125
// Monthly dividend: 125/12 ≈ 10.42

console.log('Expected monthly income: ~10.42');
console.log('Expected quarterly payment months: 3, 6, 9, 12 should have ~31.25 each');
console.log('Other months should have 0');

// Save test asset as JSON for debugging
require('fs').writeFileSync('./test-asset.json', JSON.stringify(testAsset, null, 2));
console.log('Test asset saved to test-asset.json');
