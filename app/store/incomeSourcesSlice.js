// /app/store/incomeSourcesSlice.js
import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import * as api from '../api/finance';

const incomeSourcesAdapter = createEntityAdapter({
    // sortComparer: (a, b) => a.name.localeCompare(b.name), // Optional sort
});

const initialState = incomeSourcesAdapter.getInitialState({
    loading: 'idle',
    error: null,
});

export const fetchIncomeSources = createAsyncThunk(
    'incomeSources/fetchIncomeSources',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.getIncomeSources();
            return response.data || []; // Ensure array
        } catch (error) {
            console.error("fetchIncomeSources error:", error);
            return rejectWithValue(error.message || 'Failed to fetch income sources');
        }
    }
);

export const addIncomeSource = createAsyncThunk(
    'incomeSources/addIncomeSource',
    async (incomeSource, { rejectWithValue }) => {
        try {
            const response = await api.addIncomeSource(incomeSource);
            return response;
        } catch(error) {
            console.error("addIncomeSource error:", error);
            return rejectWithValue(error.message || 'Failed to add income source');
        }
    }
);

export const updateIncomeSource = createAsyncThunk(
    'incomeSources/updateIncomeSource',
    async (incomeSource, { rejectWithValue }) => {
        try {
            const response = await api.updateIncomeSource(incomeSource);
            return response;
        } catch(error) {
            console.error("updateIncomeSource error:", error);
            return rejectWithValue(error.message || 'Failed to update income source');
        }
    }
);

export const deleteIncomeSource = createAsyncThunk(
    'incomeSources/deleteIncomeSource',
    async (incomeSourceId, { rejectWithValue }) => {
        try {
            await api.deleteIncomeSource(incomeSourceId);
            return incomeSourceId;
        } catch(error) {
            console.error("deleteIncomeSource error:", error);
            return rejectWithValue(error.message || 'Failed to delete income source');
        }
    }
);

const incomeSourcesSlice = createSlice({
    name: 'incomeSources',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetchIncomeSources
            .addCase(fetchIncomeSources.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(fetchIncomeSources.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                incomeSourcesAdapter.setAll(state, action.payload || []);
                state.error = null;
            })
            .addCase(fetchIncomeSources.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })
            // addIncomeSource
            .addCase(addIncomeSource.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(addIncomeSource.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                incomeSourcesAdapter.addOne(state, action.payload);
                state.error = null;
            })
             .addCase(addIncomeSource.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })
             // updateIncomeSource
            .addCase(updateIncomeSource.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
              .addCase(updateIncomeSource.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                incomeSourcesAdapter.updateOne(state, {
                    id: action.payload.id,
                    changes: action.payload
                });
                 state.error = null;
            })
            .addCase(updateIncomeSource.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })
             // deleteIncomeSource
            .addCase(deleteIncomeSource.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
             .addCase(deleteIncomeSource.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                incomeSourcesAdapter.removeOne(state, action.payload); // payload is ID
                 state.error = null;
            })
            .addCase(deleteIncomeSource.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })
    },
});

export const {
    selectAll: selectAllIncomeSources,
    selectById: selectIncomeSourceById,
    selectIds: selectIncomeSourceIds
} = incomeSourcesAdapter.getSelectors(state => state.incomeSources); // Ensure 'incomeSources' matches store key

export default incomeSourcesSlice.reducer;
