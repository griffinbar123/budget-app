// /app/store/categoriesSlice.test.js (Ensure top syntax is clean)

import categoriesReducer, {
    selectCurrentMonthSummary,
    selectCurrentMonthChartData,
    selectTopSpendingCategoriesChartData,
    selectAllCategories,
    selectCategoryById,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory
} from './categoriesSlice';

import { selectCurrentMonthTransactions as originalSelectCurrentMonthTransactions } from './transactionsSlice';

// --- MOCKING Setup ---
jest.mock('./transactionsSlice', () => ({
  __esModule: true,
  selectCurrentMonthTransactions: jest.fn(),
}));
// --- END MOCKING Setup ---

// Helper functions
const getCurrentMonthString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};
const currentMonth = getCurrentMonthString();
const previousMonth = (() => {
    const today = new Date();
    today.setMonth(today.getMonth() - 1);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
})();
const getInitialState = () => ({
    ids: [],
    entities: {},
    loading: 'idle',
    error: null,
});


describe('categoriesSlice', () => {
    // --- Assign the mocked function for use within tests ---
    // Use plain JS assignment
    const selectCurrentMonthTransactions = originalSelectCurrentMonthTransactions;

    // --- Reset mocks before each test ---
    beforeEach(() => {
        selectCurrentMonthTransactions.mockClear();
    });

    // --- Debug Test Suite (Keep or Remove) ---
    describe('DEBUGGING selectAllCategories', () => {
       it('should return an array from mock state', () => { /* ... test from previous step ... */ });
    });

    describe('Selectors', () => {
        describe('selectCurrentMonthSummary', () => { /* ... tests ... */ });
        describe('selectCurrentMonthChartData', () => { /* ... tests ... */ });
        describe('selectTopSpendingCategoriesChartData', () => { /* ... tests ... */ });
        describe('selectCategoryById', () => { /* ... tests ... */ });
    });

    describe('Reducer', () => {
       const initialState = getInitialState();
       it('should handle fetchCategories.fulfilled', () => { /* ... */ });
       it('should handle addCategory.fulfilled', () => { /* ... */ });
       it('should handle addCategory.rejected', () => { /* ... */ });
       it('should handle updateCategory.fulfilled', () => { /* ... */ });
       it('should handle deleteCategory.fulfilled', () => { /* ... */ });
    });
});
