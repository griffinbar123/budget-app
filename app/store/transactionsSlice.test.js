// /app/store/transactionsSlice.test.js
import transactionsReducer, {
    selectCurrentMonthTransactions,
    selectAllTransactions,
    selectTransactionById,
    selectPlaidInfo,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactions,
    fetchPlaidInfo,
    disconnectPlaidAccount
    // Import syncTransactions if testing its reducer cases
} from './transactionsSlice';

describe('transactionsSlice', () => {

    // Helper function
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
        ids: [], entities: {}, loading: 'idle', error: null,
        plaidInfo: null, plaidLoading: 'idle', plaidError: null, uncategorizedCategoryId: null,
     });

    describe('Selectors', () => {
        describe('selectCurrentMonthTransactions', () => {
            it('should return only transactions from the current month', () => {
                const mockState = {
                    transactions: {
                        ...getInitialState(),
                        ids: [101, 102, 103],
                        entities: {
                            101: { id: 101, date: `${currentMonth}-05`, type: 'expense', amount: -50 },
                            102: { id: 102, date: `${previousMonth}-10`, type: 'expense', amount: -75 },
                            103: { id: 103, date: `${currentMonth}-12`, type: 'income', amount: 200 },
                        }
                    }
                };

                // Define expected objects directly
                const expectedTransactions = [
                    { id: 101, date: `${currentMonth}-05`, type: 'expense', amount: -50 },
                    { id: 103, date: `${currentMonth}-12`, type: 'income', amount: 200 },
                ];

                // Sort expected array descending by date for comparison consistency
                expectedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                // Get actual result from selector
                const actualTransactions = selectCurrentMonthTransactions(mockState);
                // Also sort the actual result descending by date before comparing
                actualTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                // Compare the sorted arrays
                expect(actualTransactions).toEqual(expectedTransactions);
            });

             it('should return empty array if no transactions match current month', () => {
                const stateWithOld = {
                     transactions: {
                        ...getInitialState(),
                        ids: [102],
                        entities: {
                            102: { id: 102, date: `${previousMonth}-10`, type: 'expense', amount: -75 },
                        }
                     }
                };
                expect(selectCurrentMonthTransactions(stateWithOld)).toEqual([]);
            });

             it('should return empty array for empty state', () => {
                 const emptyState = {
                     transactions: { ...getInitialState() }
                 };
                 expect(selectCurrentMonthTransactions(emptyState)).toEqual([]);
             });
        });

        describe('selectTransactionById', () => {
             it('should return the correct transaction by ID', () => {
                const mockTransaction = { id: 101, description: 'Transaction One' };
                const mockState = {
                   transactions: {
                       ...getInitialState(),
                       ids: [101, 102],
                       entities: { 101: mockTransaction, 102: { id: 102, description: 'Transaction Two' } },
                   }
                };
                expect(selectTransactionById(mockState, 101)).toEqual(mockTransaction);
             });

             it('should return undefined if ID does not exist', () => {
                 const mockState = {
                    transactions: {
                        ...getInitialState(),
                        ids: [101],
                        entities: { 101: { id: 101, description: 'Transaction One' } }
                    }
                 };
                 expect(selectTransactionById(mockState, 999)).toBeUndefined();
            });
        });

        describe('selectPlaidInfo', () => {
            it('should return the plaidInfo object from state', () => {
                 const mockPlaidData = { itemId: 'abc', plaidCursor: 'xyz' };
                 const mockState = {
                     transactions: { ...getInitialState(), plaidInfo: mockPlaidData }
                 };
                 expect(selectPlaidInfo(mockState)).toEqual(mockPlaidData);
            });
             it('should return null if plaidInfo is null in state', () => {
                 const mockState = { transactions: getInitialState() };
                 expect(selectPlaidInfo(mockState)).toBeNull();
            });
        });
    });

    describe('Reducer', () => {
         const initialState = getInitialState();

         it('should handle addTransaction.fulfilled', () => {
            const newTransaction = { id: 1, date: `${currentMonth}-01`, description: 'Test', amount: -10, type: 'expense', category_id: 1 };
            const action = { type: addTransaction.fulfilled.type, payload: newTransaction };
            const state = transactionsReducer(initialState, action);
            expect(state.ids).toContain(1);
            expect(state.entities[1]).toEqual(newTransaction);
            expect(state.error).toBeNull();
        });

         it('should handle fetchTransactions.pending', () => {
             const action = { type: fetchTransactions.pending.type };
             const state = transactionsReducer(initialState, action);
             expect(state.loading).toBe('pending');
             expect(state.error).toBeNull();
         });

         it('should handle fetchTransactions.fulfilled', () => {
            const fetchedTransactions = [
                { id: 1, date: `${currentMonth}-01`, description: 'Fetched 1', amount: -10, type: 'expense' },
                { id: 2, date: `${currentMonth}-02`, description: 'Fetched 2', amount: 100, type: 'income' }
            ];
            const action = { type: fetchTransactions.fulfilled.type, payload: fetchedTransactions };
            const state = transactionsReducer(initialState, action);
            expect(state.loading).toBe('succeeded');
            // Expect sorted order based on date descending (ID 2 is newer)
            expect(state.ids).toEqual([2, 1]); // Corrected expectation
            expect(state.entities[1]).toEqual(fetchedTransactions[0]);
            expect(state.entities[2]).toEqual(fetchedTransactions[1]);
        });

        it('should handle fetchTransactions.rejected', () => {
            const errorMsg = 'Fetch failed';
            const action = { type: fetchTransactions.rejected.type, payload: errorMsg };
            const state = transactionsReducer(initialState, action);
            expect(state.loading).toBe('failed');
            expect(state.error).toBe(errorMsg);
        });

        it('should handle updateTransaction.fulfilled', () => {
            const stateBefore = { ...initialState, ids: [1], entities: { 1: { id: 1, description: 'Old Desc', amount: -50, category_id: 1 } } };
            const updatedTransaction = { id: 1, description: 'New Desc', amount: -55, category_id: 2 };
            const action = { type: updateTransaction.fulfilled.type, payload: updatedTransaction };
            const stateAfter = transactionsReducer(stateBefore, action);
            expect(stateAfter.entities[1]).toEqual(updatedTransaction);
        });

        it('should handle deleteTransaction.fulfilled', () => {
             const stateBefore = { ...initialState, ids: [1, 2], entities: { 1: { id: 1, description: 'To Delete' }, 2: { id: 2, description: 'To Keep' } } };
             const transactionIdToDelete = 1;
             const action = { type: deleteTransaction.fulfilled.type, payload: transactionIdToDelete };
             const stateAfter = transactionsReducer(stateBefore, action);
             expect(stateAfter.ids).toEqual([2]);
             expect(stateAfter.entities[1]).toBeUndefined();
             expect(stateAfter.entities[2]).toBeDefined();
         });

         it('should handle fetchPlaidInfo.pending', () => { /* ... */ });
         it('should handle fetchPlaidInfo.fulfilled', () => { /* ... */ });
         it('should handle fetchPlaidInfo.rejected', () => { /* ... */ });
         it('should handle disconnectPlaidAccount.fulfilled', () => { /* ... */ });
         it('should handle syncTransactions.fulfilled (upsert, update, remove)', () => { /* ... */ });
    });
});