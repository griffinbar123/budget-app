// /app/store/categoriesSlice.js
import { createSlice, createAsyncThunk, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import * as api from '../api/finance'; // Assuming your API helper is here
// Import the necessary selector from transactionsSlice
import { selectCurrentMonthTransactions } from './transactionsSlice';

// --- Entity Adapter ---
const categoriesAdapter = createEntityAdapter({});

// --- Initial State ---
const initialState = categoriesAdapter.getInitialState({
    loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
    error: null,     // Stores error message if a thunk fails
});

// --- Async Thunks (for API interactions) ---

// Fetches all categories for the user
export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.getCategories();
            return response.data || []; // Return empty array if data is null/undefined
        } catch (error) {
            console.error("fetchCategories error:", error);
            return rejectWithValue(error.message || 'Failed to fetch categories');
        }
    }
);

// Adds a new category
export const addCategory = createAsyncThunk(
    'categories/addCategory',
    async (categoryData, { rejectWithValue }) => {
        try {
            const response = await api.addCategory(categoryData);
            return response;
        } catch (error) {
             console.error("addCategory error:", error);
            return rejectWithValue(error.message || 'Failed to add category');
        }
    }
);

// Updates an existing category
export const updateCategory = createAsyncThunk(
    'categories/updateCategory',
    async (categoryData, { rejectWithValue }) => {
        try {
            const response = await api.updateCategory(categoryData);
            return response;
        } catch (error) {
             console.error("updateCategory error:", error);
            return rejectWithValue(error.message || 'Failed to update category');
        }
    }
);

// Deletes a category by ID
export const deleteCategory = createAsyncThunk(
    'categories/deleteCategory',
    async (categoryId, { rejectWithValue }) => {
        try {
            await api.deleteCategory(categoryId);
            return categoryId; // Return the ID for removal from state
        } catch(error) {
             console.error("deleteCategory error:", error);
            return rejectWithValue(error.message || 'Failed to delete category');
        }
    }
);

// --- Slice Definition ---
const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetchCategories
            .addCase(fetchCategories.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                categoriesAdapter.setAll(state, action.payload || []);
                state.error = null;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })
            // addCategory
            .addCase(addCategory.pending, (state) => {
                state.loading = 'pending';
                 state.error = null;
            })
            .addCase(addCategory.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                categoriesAdapter.addOne(state, action.payload);
                 state.error = null;
            })
            .addCase(addCategory.rejected, (state, action) => {
                 state.loading = 'failed';
                 state.error = action.payload;
            })
            // updateCategory
            .addCase(updateCategory.pending, (state) => {
                state.loading = 'pending';
                 state.error = null;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                 state.loading = 'succeeded';
                 categoriesAdapter.updateOne(state, {
                  id: action.payload.id,
                  changes: action.payload
                });
                 state.error = null;
            })
            .addCase(updateCategory.rejected, (state, action) => {
                 state.loading = 'failed';
                 state.error = action.payload;
            })
            // deleteCategory
            .addCase(deleteCategory.pending, (state) => {
                 state.loading = 'pending';
                  state.error = null;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                 state.loading = 'succeeded';
                 categoriesAdapter.removeOne(state, action.payload);
                 state.error = null;
            })
             .addCase(deleteCategory.rejected, (state, action) => {
                 state.loading = 'failed';
                 state.error = action.payload;
            });
    },
});

// --- Base Selectors (from adapter) ---
export const {
    selectAll: selectAllCategories,
    selectById: selectCategoryById,
    selectIds: selectCategoryIds,
    selectEntities: selectCategoryEntities,
    selectTotal: selectTotalCategories
} = categoriesAdapter.getSelectors((state) => state.categories);

// --- Derived Data Selectors (using Reselect for memoization) ---

// Selector for Summary Data (Revised for MVP)
export const selectCurrentMonthSummary = createSelector(
    [selectAllCategories, selectCurrentMonthTransactions],
    (categories, currentMonthTransactions) => {
        const categoriesArray = Array.isArray(categories) ? categories : [];
        const transactionsArray = Array.isArray(currentMonthTransactions) ? currentMonthTransactions : [];
        const totalIncomeReceivedCurrentMonth = transactionsArray
            .filter(trans => trans?.type === 'income')
            .reduce((sum, trans) => sum + Math.abs(trans?.amount || 0), 0);
        const totalExpensesSpentCurrentMonth = transactionsArray
            .filter(trans => trans?.type === 'expense')
            .reduce((sum, trans) => sum + Math.abs(trans?.amount || 0), 0);
        const totalTransactionsCurrentMonth = transactionsArray.length;
        const plannedExpensesCurrentMonth = categoriesArray
            .filter(cat => cat?.type === 'expense')
            .reduce((sum, cat) => sum + (cat?.planned_amount || 0), 0);
        const remainingExpensesCurrentMonth = plannedExpensesCurrentMonth - totalExpensesSpentCurrentMonth;
        return {
            receivedIncome: totalIncomeReceivedCurrentMonth,
            spentExpenses: totalExpensesSpentCurrentMonth,
            totalTransactions: totalTransactionsCurrentMonth,
            plannedExpenses: plannedExpensesCurrentMonth,
            remainingExpenses: remainingExpensesCurrentMonth,
        };
    }
);

// Selector for Bar Chart Data
export const selectCurrentMonthChartData = createSelector(
  [selectAllCategories, selectCurrentMonthTransactions],
  (categories, transactions) => {
    if (!Array.isArray(categories) || !Array.isArray(transactions)) {
      return [];
    }
    const spendingMap = transactions.reduce((map, trans) => {
        if (trans?.type === 'expense' && trans.category_id) {
            map[trans.category_id] = (map[trans.category_id] || 0) + Math.abs(trans.amount || 0);
        }
        return map;
    }, {});
    return categories
        .filter(category => category?.type === 'expense')
        .map((category) => {
            const categoryId = category.id;
            const spentCurrentMonth = spendingMap[categoryId] || 0;
            return {
                name: category.name || 'Unnamed',
                budget: category.planned_amount || 0,
                spent: spentCurrentMonth,
            };
        })
        .sort((a, b) => (b.budget || 0) - (a.budget || 0));
  }
);

// Selector for Pie Chart Data (Corrected + Debug Logs)
export const selectTopSpendingCategoriesChartData = createSelector(
    [selectAllCategories, selectCurrentMonthTransactions],
    (categories, currentMonthTransactions) => {
        // --- ADDED DEBUG LOGS ---
        console.log('--- Inside selectTopSpendingCategoriesChartData ---');
        console.log('Received categories:', JSON.stringify(categories));
        console.log('Received transactions:', JSON.stringify(currentMonthTransactions));
        // --- END DEBUG LOGS ---

        const TOP_N = 5;
        if (!Array.isArray(categories) || !Array.isArray(currentMonthTransactions)) {
             console.warn("TopSpending selector received invalid input (null/undefined/not array)");
             return [];
        }

        const categoryMap = categories.reduce((map, category) => {
            if (category?.id) {
                map[category.id] = category.name || 'Unnamed Category';
            }
            return map;
        }, {});

        const spendingByCategory = {};
        currentMonthTransactions.forEach(trans => {
            if (trans?.type === 'expense' && trans.category_id) {
                const categoryId = trans.category_id;
                if (categoryMap[categoryId]) {
                     spendingByCategory[categoryId] = (spendingByCategory[categoryId] || 0) + Math.abs(trans.amount || 0);
                }
            }
        });

        const spendingArray = Object.entries(spendingByCategory)
            .map(([categoryId, spent]) => ({
                name: categoryMap[categoryId] || 'Unknown Category',
                value: spent,
                id: categoryId
            }))
            .filter(item => item.name !== 'Unknown Category')
            .sort((a, b) => b.value - a.value);

        const topSpending = spendingArray.slice(0, TOP_N);
        const otherSpendingValue = spendingArray.slice(TOP_N).reduce((sum, item) => sum + item.value, 0);

        const chartData = [...topSpending];
        if (otherSpendingValue > 0.001) {
            chartData.push({ name: 'Other', value: otherSpendingValue, id: 'other' });
        }

        return chartData;
    }
);

// --- Export Reducer ---
export default categoriesSlice.reducer;
