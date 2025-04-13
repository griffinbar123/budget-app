// store/categoriesSlice.js
import { createSlice, createAsyncThunk, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import * as api from '../api/finance';
import { selectCurrentMonthTransactions, selectAllTransactions } from './transactionsSlice'; // CORRECT IMPORT
import { selectAllIncomeSources } from './incomeSourcesSlice';


const categoriesAdapter = createEntityAdapter();

const initialState = categoriesAdapter.getInitialState({
    loading: 'idle',
    error: null,
});

export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories', // Unique action type prefix
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.getCategories();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addCategory = createAsyncThunk(
    'categories/addCategory',
    async (category, {rejectWithValue}) => {
        try {
            const response = await api.addCategory(category);
            return response; // Return newly created category

        } catch (error) {
            return rejectWithValue(error.message ? error.message : error);
        }
    }
);

export const updateCategory = createAsyncThunk(
    'categories/updateCategory',
    async (category, {rejectWithValue}) => {
        try{
            const response = await api.updateCategory(category);
            return response
        } catch (error) {
            return rejectWithValue(error.message ? error.message: error)
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'categories/deleteCategory',
    async(categoryId, {rejectWithValue}) => {
        try {
            await api.deleteCategory(categoryId);
            return categoryId;
        } catch(error) {
            return rejectWithValue(error.message ? error.message: error)
        }
    }
)

const categoriesSlice = createSlice({
    name: 'categories', // Unique name
    initialState,
    reducers: {}, // Likely no synchronous reducers
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                categoriesAdapter.setAll(state, action.payload);
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })
             .addCase(addCategory.fulfilled, (state, action) => {
                categoriesAdapter.addOne(state, action.payload);  // Use the adapter
            })
              .addCase(addCategory.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload; // Store the error
            })
            // --- updateCategory ---
              .addCase(updateCategory.fulfilled, (state, action) => {
                categoriesAdapter.updateOne(state, {      // Use the adapter!
                  id: action.payload.id,
                  changes: action.payload
                });
            })
              .addCase(updateCategory.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload; // Store the error
            })
            // --- deleteCategory ---
            .addCase(deleteCategory.fulfilled, (state, action) => {
              categoriesAdapter.removeOne(state.categories, action.payload); // Use the adapter
            })
             .addCase(deleteCategory.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload; // Store the error
            })
    },
});

export const {
    selectAll: selectAllCategories,
    selectById: selectCategoryById,
    selectIds: selectCategoryIds
} = categoriesAdapter.getSelectors((state) => state.categories);

// --- Selectors for Derived Data (Moved Here) ---

export const selectCurrentMonthChartData = createSelector(
  [selectAllCategories, selectCurrentMonthTransactions], // Correctly use imported selector
  (categories, transactions) => {
    if (!categories || !transactions) {
      return []; // Return empty array if data is not loaded
    }
    const categoriesArray = Object.values(categories);
    const transactionsArray = Object.values(transactions);

    return categoriesArray.map((category) => {
      const spentCurrentMonth = transactionsArray
        .filter(
          (trans) => trans.category_id === category.id && trans.type === "expense"
        )
        .reduce((sum, trans) => sum + Math.abs(trans.amount), 0);

      return {
        name: category.name,
        budget: category.planned_amount || 0, // Use the correct property name
        spent: spentCurrentMonth,
        remaining: (category.planned_amount || 0) - spentCurrentMonth, // Use correct property
      };
    });
  }
);
export const selectCurrentMonthSummary = createSelector(
    [selectAllCategories, selectCurrentMonthTransactions, selectAllIncomeSources],
    (categories, transactions, incomeSources) => {


        // Calculate total income received.
        const totalIncomeReceivedCurrentMonth = Object.values(transactions) // Convert to array
            .filter(trans => trans.type === 'income')
            .reduce((sum, trans) => sum + Math.abs(trans.amount), 0);

        // Calculate total expenses spent.
        const totalExpensesSpentCurrentMonth = Object.values(transactions) // Convert to array
            .filter(trans => trans.type === 'expense')
            .reduce((sum, trans) => sum + Math.abs(trans.amount), 0);

        // Calculate planned expenses and reserves for this month.
        const plannedExpenses = Object.values(categories)
            .filter(cat => cat.type === 'expense')
            .reduce((sum, cat) => sum + (cat.planned_amount || 0), 0);

        const plannedReserves = Object.values(categories)
            .filter(cat => cat.type === 'reserve')
            .reduce((sum, cat) => sum + (cat.planned_amount || 0), 0);

          // Calculate total amount moved to reserves this month.
        const currentMonthSavingsForReserves = Object.values(transactions)
            .filter(trans => trans.type === 'transfer')  //  Filter by 'transfer' type
            .reduce((sum, trans) => sum + Math.abs(trans.amount), 0);
        // Calculate total planned income

        const totalIncomePlannedMonthly = Object.values(incomeSources).reduce((sum, source) => sum + (source.plannedAmount || 0), 0);

        return {
            totalAssets: 0,  // You'll need to fetch/calculate this
            budgetedThisMonth: plannedExpenses + plannedReserves,
            plannedIncome: totalIncomePlannedMonthly,
            plannedExpenses: plannedExpenses,
            plannedReserves: plannedReserves,
            receivedIncome: totalIncomeReceivedCurrentMonth,
            spentExpenses: totalExpensesSpentCurrentMonth,
            reservedReserves: currentMonthSavingsForReserves,
            remainingIncome: totalIncomePlannedMonthly - totalIncomeReceivedCurrentMonth,
            remainingExpenses: plannedExpenses - totalExpensesSpentCurrentMonth,
            remainingReserves: plannedReserves - currentMonthSavingsForReserves,
        };
    }
);
export default categoriesSlice.reducer;