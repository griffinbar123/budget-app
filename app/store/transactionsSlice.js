// store/transactionsSlice.js
import { createSlice, createAsyncThunk, createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import * as api from '../api/finance';

const transactionsAdapter = createEntityAdapter();

const initialState = transactionsAdapter.getInitialState({
    loading: 'idle',
    error: null,
    plaidInfo: null, // To store { itemId: ..., plaidCursor: ... }
    plaidLoading: 'idle', // Separate loading state for Plaid connection
    plaidError: null,    // Separate error state for Plaid connection
    uncategorizedCategoryId: null, // To store the ID of the "Uncategorized" category
});

// --- Thunks ---

export const fetchTransactions = createAsyncThunk(
    'transactions/fetchTransactions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.getTransactions();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
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
            return rejectWithValue(error.message);
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
            return rejectWithValue(error.message);
        }
    }
);

export const deleteTransaction = createAsyncThunk(
    'transactions/deleteTransaction',
    async (transactionId, { rejectWithValue }) => {
        try {
            await api.deleteTransaction(transactionId);
            return transactionId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- Thunk for fetching Plaid connection info ---
export const fetchPlaidInfo = createAsyncThunk(
    'transactions/fetchPlaidInfo', // transactions/ prefix
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.getPlaidInfo();  // Calls /api/user/plaid-info
            return response; // Returns { itemId: '...', plaidCursor: '...' }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const disconnectPlaidAccount = createAsyncThunk(
    'transactions/disconnectPlaidAccount',
    async (_, {rejectWithValue}) => {
        try{
            await api.disconnectPlaidAccount();
            return;
        } catch(error) {
            return rejectWithValue(error.message)
        }
    }
)

// --- Thunk for fetching the "Uncategorized" category ID ---
export const fetchUncategorizedCategoryId = createAsyncThunk(
    'transactions/fetchUncategorizedCategoryId',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.getUncategorizedCategory(); // Calls /api/categories/uncategorized
            return response.data.id;  // Expects { data: { id: ... } }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- Thunk for syncing transactions with Plaid ---
export const syncTransactions = createAsyncThunk(
    'transactions/syncTransactions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.syncTransactions(); // Calls /api/transactions/sync
            return response; // Returns { added, modified, removed, nextCursor }
        } catch (error) {
            return rejectWithValue(error.message);
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
                transactionsAdapter.setAll(state, action.payload);
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })

            // --- syncTransactions ---
            .addCase(syncTransactions.pending, (state) => {
                state.loading = 'pending'; // Could use a separate loading state
                state.error = null;
            })
            .addCase(syncTransactions.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                const { added, modified, removed } = action.payload;
                transactionsAdapter.addMany(state, added);
                transactionsAdapter.updateMany(state, modified.map(t => ({ id: t.plaid_transaction_id, changes: t })));
                transactionsAdapter.removeMany(state, removed.map(t => t.plaid_transaction_id));
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
                transactionsAdapter.addOne(state, action.payload);
            })
            .addCase(addTransaction.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })

            // --- updateTransaction ---
            .addCase(updateTransaction.fulfilled, (state, action) => {
                transactionsAdapter.updateOne(state, {
                    id: action.payload.id,
                    changes: action.payload,
                });
            })
            .addCase(updateTransaction.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })

            // --- deleteTransaction ---
            .addCase(deleteTransaction.fulfilled, (state, action) => {
                transactionsAdapter.removeOne(state, action.payload);
            })
            .addCase(deleteTransaction.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })
            // --- fetchPlaidInfo ---
            .addCase(fetchPlaidInfo.pending, (state) => {
                state.plaidLoading = 'pending'; // Use Plaid specific loading state
                state.plaidError = null;
            })
            .addCase(fetchPlaidInfo.fulfilled, (state, action) => {
                state.plaidLoading = 'succeeded';
                state.plaidInfo = action.payload; // Store the Plaid info (accessToken, itemId)
            })
            .addCase(fetchPlaidInfo.rejected, (state, action) => {
                state.plaidLoading = 'failed';
                state.plaidError = action.payload; // Store the error
            })
             .addCase(disconnectPlaidAccount.fulfilled, (state) => {
              state.plaidInfo = null; // Clear the Plaid info
            })
            .addCase(disconnectPlaidAccount.rejected, (state, action) => {
                state.error = action.payload
            })

            // --- fetchUncategorizedCategoryId ---
            .addCase(fetchUncategorizedCategoryId.fulfilled, (state, action) => {
                state.uncategorizedCategoryId = action.payload;
            })
            .addCase(fetchUncategorizedCategoryId.rejected, (state, action) => {
                console.error("Failed to fetch Uncategorized category ID:", action.payload);
                state.error = action.payload;  //  Store the error
            });
    },
});

// --- Selectors ---
export const {
    selectAll: selectAllTransactions,
    selectById: selectTransactionById,
    selectIds: selectTransactionIds
} = transactionsAdapter.getSelectors((state) => state.transactions);

// Custom selector for current month transactions
export const selectCurrentMonthTransactions = createSelector(
    [selectAllTransactions],
    (transactions) => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
        const currentMonthString = `${currentYear}-${currentMonth}`;

        return Object.values(transactions).filter(transaction => transaction.date.startsWith(currentMonthString));
    }
);

// Selector for Plaid info
export const selectPlaidInfo = (state) => state.transactions.plaidInfo;

// Selector for the "Uncategorized" category ID
export const selectUncategorizedCategoryId = (state) => state.transactions.uncategorizedCategoryId;

export const {} = transactionsSlice.actions
export default transactionsSlice.reducer;