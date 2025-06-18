import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AssetCategory, AssetCategoryOption, AssetCategoryAssignment } from '@/types/domains/assets';
import Logger from '../../service/Logger/logger';
import sqliteService from '../../service/sqlLiteService';

type AssetCategoriesStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
type AssetCategorySystemFields = 'id' | 'createdAt' | 'updatedAt';

interface AssetCategoriesState {
  categories: AssetCategory[];
  categoryOptions: AssetCategoryOption[];
  categoryAssignments: AssetCategoryAssignment[];
  status: AssetCategoriesStatus;
  error: string | null;
}

const initialState: AssetCategoriesState = {
  categories: [],
  categoryOptions: [],
  categoryAssignments: [],
  status: 'idle',
  error: null,
};

// Async thunks for categories
export const fetchAssetCategories = createAsyncThunk(
  'assetCategories/fetchAssetCategories',
  async () => {
    Logger.info('Fetching asset categories from database');
    try {
      const categories = await sqliteService.getAll('assetCategories');
      Logger.info(`Fetched ${categories.length} asset categories`);
      return categories;
    } catch (error) {
      Logger.error(`Error fetching asset categories: ${error}`);
      return [];
    }
  }
);

export const addAssetCategory = createAsyncThunk(
  'assetCategories/addAssetCategory',
  async (categoryData: Omit<AssetCategory, AssetCategorySystemFields>) => {
    Logger.info(`Adding asset category to database: ${categoryData.name}`);
    
    try {
      // Generate a more robust ID using crypto.randomUUID or fallback
      const generateId = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID();
        }
        return `category-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      };

      const newCategory: AssetCategory = {
        ...categoryData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      Logger.info(`Category with ID created: ${JSON.stringify(newCategory)}`);
      
      // Verify database stores exist first
      const allStores = await sqliteService.getAll('assetCategories');
      Logger.info(`Current categories in database: ${allStores.length}`);
      
      const result = await sqliteService.add('assetCategories', newCategory);
      Logger.info(`SQLite service add result: ${result}`);
      
      // Verify the category was actually saved
      const savedCategory = await sqliteService.getById('assetCategories', newCategory.id);
      if (savedCategory) {
        Logger.info(`Asset category verified in storage: ${savedCategory.name}`);
      } else {
        Logger.error(`Asset category NOT found in storage after save!`);
      }
      
      return newCategory;
    } catch (error) {
      Logger.error(`Error saving asset category to database: ${error}`);
      throw error;
    }
  }
);

export const updateAssetCategory = createAsyncThunk(
  'assetCategories/updateAssetCategory',
  async (category: AssetCategory) => {
    Logger.info(`Updating asset category in database: ${category.name}`);
    
    try {
      const updatedCategory = {
        ...category,
        updatedAt: new Date().toISOString(),
      };
      
      await sqliteService.update('assetCategories', updatedCategory);
      Logger.info(`Asset category updated successfully: ${updatedCategory.name}`);
      return updatedCategory;
    } catch (error) {
      Logger.error(`Error updating asset category in database: ${error}`);
      throw error;
    }
  }
);

export const deleteAssetCategory = createAsyncThunk(
  'assetCategories/deleteAssetCategory',
  async (id: string) => {
    Logger.info(`Deleting asset category from database: ${id}`);
    
    try {
      await sqliteService.remove('assetCategories', id);
      Logger.info(`Asset category deleted successfully: ${id}`);
      return id;
    } catch (error) {
      Logger.error(`Error deleting asset category from database: ${error}`);
      throw error;
    }
  }
);

// Async thunks for category options
export const fetchAssetCategoryOptions = createAsyncThunk(
  'assetCategories/fetchAssetCategoryOptions',
  async () => {
    Logger.info('Fetching asset category options from database');
    try {
      const options = await sqliteService.getAll('assetCategoryOptions');
      Logger.info(`Fetched ${options.length} asset category options`);
      return options;
    } catch (error) {
      Logger.error(`Error fetching asset category options: ${error}`);
      return [];
    }
  }
);

export const addAssetCategoryOption = createAsyncThunk(
  'assetCategories/addAssetCategoryOption',
  async (optionData: Omit<AssetCategoryOption, 'id' | 'createdAt' | 'updatedAt'>) => {
    Logger.info(`Adding asset category option to database: ${optionData.name}`);
    
    try {
      // Generate a more robust ID using crypto.randomUUID or fallback
      const generateId = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID();
        }
        return `option-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      };

      const newOption: AssetCategoryOption = {
        ...optionData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      Logger.info(`Option with ID created: ${JSON.stringify(newOption)}`);
      
      const result = await sqliteService.add('assetCategoryOptions', newOption);
      Logger.info(`SQLite service add result for option: ${result}`);
      
      // Verify the option was actually saved
      const savedOption = await sqliteService.getById('assetCategoryOptions', newOption.id);
      if (savedOption) {
        Logger.info(`Asset category option verified in storage: ${savedOption.name}`);
      } else {
        Logger.error(`Asset category option NOT found in storage after save!`);
      }
      
      return newOption;
    } catch (error) {
      Logger.error(`Error saving asset category option to database: ${error}`);
      throw error;
    }
  }
);

export const updateAssetCategoryOption = createAsyncThunk(
  'assetCategories/updateAssetCategoryOption',
  async (option: AssetCategoryOption) => {
    Logger.info(`Updating asset category option in database: ${option.name}`);
    
    try {
      const updatedOption = {
        ...option,
        updatedAt: new Date().toISOString(),
      };
      
      await sqliteService.update('assetCategoryOptions', updatedOption);
      Logger.info(`Asset category option updated successfully: ${updatedOption.name}`);
      return updatedOption;
    } catch (error) {
      Logger.error(`Error updating asset category option in database: ${error}`);
      throw error;
    }
  }
);

export const deleteAssetCategoryOption = createAsyncThunk(
  'assetCategories/deleteAssetCategoryOption',
  async (id: string) => {
    Logger.info(`Deleting asset category option from database: ${id}`);
    
    try {
      await sqliteService.remove('assetCategoryOptions', id);
      Logger.info(`Asset category option deleted successfully: ${id}`);
      return id;
    } catch (error) {
      Logger.error(`Error deleting asset category option from database: ${error}`);
      throw error;
    }
  }
);

// Async thunks for category assignments
export const fetchAssetCategoryAssignments = createAsyncThunk(
  'assetCategories/fetchAssetCategoryAssignments',
  async () => {
    Logger.info('Fetching asset category assignments from database');
    try {
      const assignments = await sqliteService.getAll('assetCategoryAssignments');
      Logger.info(`Fetched ${assignments.length} asset category assignments`);
      return assignments;
    } catch (error) {
      Logger.error(`Error fetching asset category assignments: ${error}`);
      return [];
    }
  }
);

export const addAssetCategoryAssignment = createAsyncThunk(
  'assetCategories/addAssetCategoryAssignment',
  async (assignmentData: Omit<AssetCategoryAssignment, 'id' | 'createdAt' | 'updatedAt'>) => {
    Logger.info(`Adding asset category assignment to database`);
    
    try {
      const newAssignment: AssetCategoryAssignment = {
        ...assignmentData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const savedId = await sqliteService.add('assetCategoryAssignments', newAssignment);
      const savedAssignment = { ...newAssignment, id: savedId };
      Logger.info(`Asset category assignment saved successfully`);
      return savedAssignment;
    } catch (error) {
      Logger.error(`Error saving asset category assignment to database: ${error}`);
      throw error;
    }
  }
);

export const updateAssetCategoryAssignment = createAsyncThunk(
  'assetCategories/updateAssetCategoryAssignment',
  async (assignment: AssetCategoryAssignment) => {
    Logger.info(`Updating asset category assignment in database`);
    
    try {
      const updatedAssignment = {
        ...assignment,
        updatedAt: new Date().toISOString(),
      };
      
      await sqliteService.update('assetCategoryAssignments', updatedAssignment);
      Logger.info(`Asset category assignment updated successfully`);
      return updatedAssignment;
    } catch (error) {
      Logger.error(`Error updating asset category assignment in database: ${error}`);
      throw error;
    }
  }
);

export const deleteAssetCategoryAssignment = createAsyncThunk(
  'assetCategories/deleteAssetCategoryAssignment',
  async (id: string) => {
    Logger.info(`Deleting asset category assignment from database: ${id}`);
    
    try {
      await sqliteService.remove('assetCategoryAssignments', id);
      Logger.info(`Asset category assignment deleted successfully: ${id}`);
      return id;
    } catch (error) {
      Logger.error(`Error deleting asset category assignment from database: ${error}`);
      throw error;
    }
  }
);

// Helper function to delete assignments by asset definition ID
export const deleteAssetCategoryAssignmentsByAssetId = createAsyncThunk(
  'assetCategories/deleteAssetCategoryAssignmentsByAssetId',
  async (assetDefinitionId: string, { getState }) => {
    Logger.info(`Deleting all category assignments for asset: ${assetDefinitionId}`);
    
    const state = getState() as { assetCategories: AssetCategoriesState };
    const assignmentsToDelete = state.assetCategories.categoryAssignments.filter(
      assignment => assignment.assetDefinitionId === assetDefinitionId
    );
    
    try {
      const deletePromises = assignmentsToDelete.map(assignment => 
        sqliteService.remove('assetCategoryAssignments', assignment.id)
      );
      
      await Promise.all(deletePromises);
      
      const deletedIds = assignmentsToDelete.map(assignment => assignment.id);
      Logger.info(`Deleted ${deletedIds.length} category assignments for asset`);
      return deletedIds;
    } catch (error) {
      Logger.error(`Error deleting category assignments for asset: ${error}`);
      throw error;
    }
  }
);

const assetCategoriesSlice = createSlice({
  name: 'assetCategories',
  initialState,
  reducers: {
    // Clear all asset categories action
    clearAllAssetCategories: (state) => {
      state.categories = [];
      state.categoryOptions = [];
      state.categoryAssignments = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchAssetCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAssetCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchAssetCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch asset categories';
      })
      
      // Add category
      .addCase(addAssetCategory.pending, (state) => {
        Logger.info('Adding category - pending');
        state.status = 'loading';
      })
      .addCase(addAssetCategory.fulfilled, (state, action) => {
        Logger.info(`Adding category - fulfilled: ${JSON.stringify(action.payload)}`);
        state.categories.push(action.payload);
        state.status = 'succeeded';
        Logger.info(`Categories array now has ${state.categories.length} items`);
      })
      .addCase(addAssetCategory.rejected, (state, action) => {
        Logger.error(`Adding category - rejected: ${action.error.message}`);
        state.status = 'failed';
        state.error = action.error.message || 'Failed to add asset category';
      })
      
      // Update category
      .addCase(updateAssetCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      
      // Delete category
      .addCase(deleteAssetCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(item => item.id !== action.payload);
      })
      
      // Fetch category options
      .addCase(fetchAssetCategoryOptions.fulfilled, (state, action) => {
        state.categoryOptions = action.payload;
      })
      
      // Add category option
      .addCase(addAssetCategoryOption.fulfilled, (state, action) => {
        state.categoryOptions.push(action.payload);
      })
      
      // Update category option
      .addCase(updateAssetCategoryOption.fulfilled, (state, action) => {
        const index = state.categoryOptions.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.categoryOptions[index] = action.payload;
        }
      })
      
      // Delete category option
      .addCase(deleteAssetCategoryOption.fulfilled, (state, action) => {
        state.categoryOptions = state.categoryOptions.filter(item => item.id !== action.payload);
      })
      
      // Fetch category assignments
      .addCase(fetchAssetCategoryAssignments.fulfilled, (state, action) => {
        state.categoryAssignments = action.payload;
      })
      
      // Add category assignment
      .addCase(addAssetCategoryAssignment.fulfilled, (state, action) => {
        state.categoryAssignments.push(action.payload);
      })
      
      // Update category assignment
      .addCase(updateAssetCategoryAssignment.fulfilled, (state, action) => {
        const index = state.categoryAssignments.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.categoryAssignments[index] = action.payload;
        }
      })
      
      // Delete category assignment
      .addCase(deleteAssetCategoryAssignment.fulfilled, (state, action) => {
        state.categoryAssignments = state.categoryAssignments.filter(item => item.id !== action.payload);
      })
      
      // Delete assignments by asset ID
      .addCase(deleteAssetCategoryAssignmentsByAssetId.fulfilled, (state, action) => {
        state.categoryAssignments = state.categoryAssignments.filter(
          item => !action.payload.includes(item.id)
        );
      });
  },
});

export const { clearAllAssetCategories } = assetCategoriesSlice.actions;

export default assetCategoriesSlice.reducer;
