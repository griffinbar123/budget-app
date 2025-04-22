// /app/store/transactionsSlice.js
import { createSlice, createAsyncThunk, createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import * as api from '../api/finance';

const transactionsAdapter = createEntityAdapter({
    // Keep transactions sorted by date descending by default in state?
    sortComparer: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
});

const initialState = transactionsAdapter.getInitialState({
    loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
    error: null,
    plaidInfo: null, // Stores { itemId, plaidCursor } from API
    plaidLoading: 'idle',
    plaidError: null,
    uncategorizedCategoryId: null, // Stores ID if fetched
});

// --- Thunks ---
export const fetchTransactions = createAsyncThunk(
    'transactions/fetchTransactions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.getTransactions();
            return response.data || []; // Ensure array
        } catch (error) {
            console.error("fetchTransactions error:", error);
            return rejectWithValue(error.message || 'Failed to fetch transactions');
        }
    }
);

export const addTransaction = createAsyncThunk(
    'transactions/addTransaction',
    async (transaction, { rejectWithValue }) => {
        try {
            const newTransaction = await api.addTransaction(transaction);
            return newTransaction;
        } catch (error) {
            console.error("addTransaction error:", error);
            return rejectWithValue(error.message || 'Failed to add transaction');
        }
    }
);

export const updateTransaction = createAsyncThunk(
    'transactions/updateTransaction',
    async (transaction, { rejectWithValue }) => {
        try {
            const updatedTransaction = await api.updateTransaction(transaction);
            return updatedTransaction;
        } catch (error) {
            console.error("updateTransaction error:", error);
            return rejectWithValue(error.message || 'Failed to update transaction');
        }
    }
);

export const deleteTransaction = createAsyncThunk(
    'transactions/deleteTransaction',
    async (transactionId, { rejectWithValue }) => {
        try {
            await api.deleteTransaction(transactionId);
            return transactionId; // Return ID for removal
        } catch (error) {
            console.error("deleteTransaction error:", error);
            return rejectWithValue(error.message || 'Failed to delete transaction');
        }
    }
);

export const fetchPlaidInfo = createAsyncThunk(
    'transactions/fetchPlaidInfo',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.getPlaidInfo();
            return response; // Returns { itemId, plaidCursor }
        } catch (error) {
            console.error("fetchPlaidInfo error:", error);
            // Don't necessarily reject if Plaid isn't connected, maybe return null?
            if (error.message?.includes('401') || error.message?.includes('404')) {
                 return null; // Treat as 'not connected'
            }
            return rejectWithValue(error.message || 'Failed to fetch Plaid info');
        }
    }
);

export const disconnectPlaidAccount = createAsyncThunk(
    'transactions/disconnectPlaidAccount',
    async (_, {rejectWithValue}) => {
        try{
            await api.disconnectPlaidAccount();
            return; // No payload needed on success
        } catch(error) {
             console.error("disconnectPlaidAccount error:", error);
            return rejectWithValue(error.message || 'Failed to disconnect Plaid');
        }
    }
)

export const fetchUncategorizedCategoryId = createAsyncThunk(
    'transactions/fetchUncategorizedCategoryId',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.getUncategorizedCategory();
            return response.data.id; // Expects { data: { id: ... } }
        } catch (error) {
             console.error("fetchUncategorizedCategoryId error:", error);
            return rejectWithValue(error.message || 'Failed to fetch Uncategorized ID');
        }
    }
);

export const syncTransactions = createAsyncThunk(
    'transactions/syncTransactions',
    async (_, { rejectWithValue }) => {
        try {
            // API returns { message, added, modified, removed, nextCursor }
            const response = await api.syncTransactions();
            return response; // Return the full response object
        } catch (error) {
             console.error("syncTransactions error:", error);
            return rejectWithValue(error.message || 'Failed to sync transactions');
        }
    }
);


const transactionsSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // --- fetchTransactions ---
            .addCase(fetchTransactions.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                transactionsAdapter.setAll(state, action.payload || []);
                state.error = null;
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })

            // --- syncTransactions ---
            .addCase(syncTransactions.pending, (state) => {
                state.loading = 'pending'; // Use main loading or a specific sync loading state?
                state.error = null;
            })
            .addCase(syncTransactions.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.error = null;
                // Payload should be { added: [], modified: [], removed: [], ... }
                const { added = [], modified = [], removed = [] } = action.payload || {};

                // Use adapter methods - Ensure IDs match for updates/removals
                if (added.length > 0) transactionsAdapter.upsertMany(state, added); // Use upsertMany for added items from sync
                if (modified.length > 0) transactionsAdapter.updateMany(state, modified.map(t => ({ id: t.id, changes: t }))); // Assuming modified has full transaction w/ DB ID
                if (removed.length > 0) transactionsAdapter.removeMany(state, removed.map(t => t.id)); // Assuming removed has DB ID?
                 // NOTE: Check if Plaid returns DB IDs or plaid_transaction_ids for modified/removed
                 // Adjust id mapping for updateMany/removeMany if necessary

                // Update cursor info if needed (though API handles DB update)
                if (action.payload?.nextCursor) {
                    if (state.plaidInfo) {
                         state.plaidInfo.plaidCursor = action.payload.nextCursor;
                    }
                }
            })
            .addCase(syncTransactions.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })

            // --- addTransaction ---
            .addCase(addTransaction.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(addTransaction.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                transactionsAdapter.addOne(state, action.payload); // Add returned transaction
                state.error = null;
            })
            .addCase(addTransaction.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })

            // --- updateTransaction ---
            .addCase(updateTransaction.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(updateTransaction.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                transactionsAdapter.updateOne(state, {
                    id: action.payload.id,
                    changes: action.payload,
                });
                state.error = null;
            })
            .addCase(updateTransaction.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })

            // --- deleteTransaction ---
             .addCase(deleteTransaction.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(deleteTransaction.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                transactionsAdapter.removeOne(state, action.payload); // action.payload is transactionId
                state.error = null;
            })
            .addCase(deleteTransaction.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })

            // --- fetchPlaidInfo ---
            .addCase(fetchPlaidInfo.pending, (state) => {
                state.plaidLoading = 'pending';
                state.plaidError = null;
            })
            .addCase(fetchPlaidInfo.fulfilled, (state, action) => {
                state.plaidLoading = 'succeeded';
                state.plaidInfo = action.payload; // Stores { itemId, plaidCursor } or null
                state.plaidError = null;
            })
            .addCase(fetchPlaidInfo.rejected, (state, action) => {
                state.plaidLoading = 'failed';
                state.plaidError = action.payload;
                state.plaidInfo = null; // Clear plaid info on error
            })

             // --- disconnectPlaidAccount ---
            .addCase(disconnectPlaidAccount.pending, (state) => {
                 state.plaidLoading = 'pending'; // Reuse plaid loading state
                 state.plaidError = null;
            })
            .addCase(disconnectPlaidAccount.fulfilled, (state) => {
              state.plaidLoading = 'succeeded';
              state.plaidInfo = null; // Clear the Plaid info
              state.plaidError = null;
            })
            .addCase(disconnectPlaidAccount.rejected, (state, action) => {
                state.plaidLoading = 'failed';
                state.plaidError = action.payload; // Store disconnect error
            })

            // --- fetchUncategorizedCategoryId ---
            .addCase(fetchUncategorizedCategoryId.pending, (state) => {
                // Optionally handle pending state if UI needs it
            })
            .addCase(fetchUncategorizedCategoryId.fulfilled, (state, action) => {
                state.uncategorizedCategoryId = action.payload; // Store the ID
                 state.error = null; // Clear general error on success
            })
            .addCase(fetchUncategorizedCategoryId.rejected, (state, action) => {
                // Log error but maybe don't block UI with general error state?
                console.error("Failed to fetch Uncategorized category ID:", action.payload);
                // state.error = action.payload; // Decide if this should set general error
            });
    },
});

// --- Selectors ---
export const {
    selectAll: selectAllTransactions,
    selectById: selectTransactionById,
    selectIds: selectTransactionIds,
    selectEntities: selectTransactionEntities,
    selectTotal: selectTotalTransactions
} = transactionsAdapter.getSelectors((state) => state.transactions);

// Custom selector for current month transactions
export const selectCurrentMonthTransactions = createSelector(
    [selectAllTransactions],
    (transactions) => {
        if (!Array.isArray(transactions)) return []; // Safety check
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
        const currentMonthString = `${currentYear}-${currentMonth}`;
        // Filter checking date exists before calling startsWith
        return transactions.filter(transaction => transaction?.date?.startsWith(currentMonthString));
    }
);

// Selector for Plaid info
export const selectPlaidInfo = (state) => state.transactions.plaidInfo;

// Selector for the "Uncategorized" category ID
export const selectUncategorizedCategoryId = (state) => state.transactions.uncategorizedCategoryId;

// Export reducer
export default transactionsSlice.reducer;
