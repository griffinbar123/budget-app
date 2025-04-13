// store/incomeSourcesSlice.js
import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import * as api from '../api/finance';

const incomeSourcesAdapter = createEntityAdapter();

const initialState = incomeSourcesAdapter.getInitialState({
    loading: 'idle',
    error: null,
});

export const fetchIncomeSources = createAsyncThunk(
    'incomeSources/fetchIncomeSources',  // Unique action type prefix
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.getIncomeSources();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addIncomeSource = createAsyncThunk( //create thunk
    'incomeSources/addIncomeSource',
    async (incomeSource, { rejectWithValue }) => {
        try {
            const response = await api.addIncomeSource(incomeSource);
            return response;
        } catch(error) {
            return rejectWithValue(error.message)
        }
    }
)

export const updateIncomeSource = createAsyncThunk( //create thunk
'incomeSources/updateIncomeSource',
async (incomeSource, { rejectWithValue }) => {
    try {
        const response = await api.updateIncomeSource(incomeSource);
        return response;
    } catch(error) {
        return rejectWithValue(error.message)
    }
}
)

export const deleteIncomeSource = createAsyncThunk( //create thunk
'incomeSources/deleteIncomeSource',
async (incomeSourceId, { rejectWithValue }) => {
    try {
        await api.deleteIncomeSource(incomeSourceId);
        return incomeSourceId;
    } catch(error) {
        return rejectWithValue(error.message)
    }
}
)

const incomeSourcesSlice = createSlice({
    name: 'incomeSources', // Unique name
    initialState,
    reducers: {}, // Likely no synchronous reducers
    extraReducers: (builder) => {
        builder
            .addCase(fetchIncomeSources.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(fetchIncomeSources.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                incomeSourcesAdapter.setAll(state, action.payload);
            })
            .addCase(fetchIncomeSources.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })
            //add cases for crud
            .addCase(addIncomeSource.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                incomeSourcesAdapter.addOne(state, action.payload)
            })
             .addCase(addIncomeSource.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })
              .addCase(updateIncomeSource.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                incomeSourcesAdapter.updateOne(state, {
                    id: action.payload.id,
                    changes: action.payload
                });
            })
            .addCase(updateIncomeSource.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })
             .addCase(deleteIncomeSource.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                incomeSourcesAdapter.removeOne(state, action.payload);
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
} = incomeSourcesAdapter.getSelectors(state => state.incomeSources)

export default incomeSourcesSlice.reducer;