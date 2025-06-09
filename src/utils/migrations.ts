// Migration utility for database schema updates
export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  message: string;
}

// Migration to add transactionType field to existing assets
export async function migrateTransactionTypes(): Promise<MigrationResult> {
  return new Promise((resolve) => {
    try {
      // Check if IndexedDB is available
      if (!window.indexedDB) {
        resolve({
          success: false,
          migratedCount: 0,
          message: 'IndexedDB not available'
        });
        return;
      }

      // Open the database
      const request = indexedDB.open('financeDB', 3);
      
      request.onsuccess = function(event) {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Check if assets store exists
        if (!db.objectStoreNames.contains('assets')) {
          resolve({
            success: true,
            migratedCount: 0,
            message: 'No assets store found - no migration needed'
          });
          return;
        }

        // Start a transaction
        const transaction = db.transaction(['assets'], 'readwrite');
        const store = transaction.objectStore('assets');
        
        // Get all assets
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = function() {
          const assets = getAllRequest.result;
          let migratedCount = 0;
          let processedCount = 0;
          
          console.log(`[Migration] Found ${assets.length} assets to check for transactionType field`);
          
          if (assets.length === 0) {
            resolve({
              success: true,
              migratedCount: 0,
              message: 'No assets found - no migration needed'
            });
            return;
          }

          assets.forEach(asset => {
            // Check if transactionType is missing
            if (!asset.transactionType) {
              asset.transactionType = 'buy';
              
              // Update the asset in the database
              const updateRequest = store.put(asset);
              updateRequest.onsuccess = function() {
                migratedCount++;
                processedCount++;
                console.log(`[Migration] Updated asset: ${asset.name} with transactionType: 'buy'`);
                
                // Check if all assets are processed
                if (processedCount === assets.length) {
                  resolve({
                    success: true,
                    migratedCount,
                    message: `Migration completed! ${migratedCount} assets updated with transactionType field`
                  });
                }
              };
              
              updateRequest.onerror = function() {
                processedCount++;
                console.error(`[Migration] Error updating asset: ${asset.name}`);
                
                if (processedCount === assets.length) {
                  resolve({
                    success: false,
                    migratedCount,
                    message: `Migration completed with errors. ${migratedCount} assets updated`
                  });
                }
              };
            } else {
              processedCount++;
              // Asset already has transactionType, skip
              if (processedCount === assets.length) {
                resolve({
                  success: true,
                  migratedCount,
                  message: `Migration completed! ${migratedCount} assets updated with transactionType field`
                });
              }
            }
          });
        };
        
        getAllRequest.onerror = function() {
          resolve({
            success: false,
            migratedCount: 0,
            message: 'Error fetching assets for migration'
          });
        };
        
        transaction.onerror = function() {
          resolve({
            success: false,
            migratedCount: 0,
            message: 'Transaction error during migration'
          });
        };
      };
      
      request.onerror = function() {
        resolve({
          success: false,
          migratedCount: 0,
          message: 'Error opening database for migration'
        });
      };
      
    } catch (error) {
      resolve({
        success: false,
        migratedCount: 0,
        message: `Migration error: ${error}`
      });
    }
  });
}

// Run all available migrations
export async function runMigrations(): Promise<void> {
  console.log('[Migrations] Starting database migrations...');
  
  try {
    // Run transaction type migration
    const transactionTypeResult = await migrateTransactionTypes();
    
    if (transactionTypeResult.success) {
      console.log(`[Migrations] ✅ ${transactionTypeResult.message}`);
    } else {
      console.error(`[Migrations] ❌ ${transactionTypeResult.message}`);
    }
    
    console.log('[Migrations] All migrations completed');
  } catch (error) {
    console.error('[Migrations] Error running migrations:', error);
  }
}
