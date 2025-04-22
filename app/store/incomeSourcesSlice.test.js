// /app/store/incomeSourcesSlice.test.js
import incomeSourcesReducer, {
    fetchIncomeSources,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    selectIncomeSourceById // Added selector
} from './incomeSourcesSlice';

describe('incomeSourcesSlice', () => {

    const getInitialState = () => ({
        ids: [],
        entities: {},
        loading: 'idle',
        error: null,
    });

    describe('Selectors', () => {
        describe('selectIncomeSourceById', () => {
            it('should return the correct income source by ID', () => {
                const mockSource = { id: 1, name: 'Salary' };
                const mockState = {
                    incomeSources: { // Ensure slice name matches store key
                        ...getInitialState(),
                        ids: [1, 2],
                        entities: { 1: mockSource, 2: { id: 2, name: 'Other Source' } }
                    }
                };
                expect(selectIncomeSourceById(mockState, 1)).toEqual(mockSource);
            });
             it('should return undefined if ID does not exist', () => {
                 const mockState = {
                    incomeSources: {
                        ...getInitialState(),
                        ids: [1],
                        entities: { 1: { id: 1, name: 'Test Source' } }
                    }
                 };
                 expect(selectIncomeSourceById(mockState, 999)).toBeUndefined();
            });
        });
    });

    describe('Reducer', () => {
        const initialState = getInitialState();

        it('should handle fetchIncomeSources.pending', () => { /* ... */ });
        it('should handle fetchIncomeSources.fulfilled', () => { /* ... */ });
        it('should handle fetchIncomeSources.rejected', () => { /* ... */ });
        it('should handle addIncomeSource.fulfilled', () => { /* ... */ });

        // --- NEW Reducer Tests ---
        it('should handle updateIncomeSource.fulfilled', () => {
            const stateBefore = {
                ...initialState,
                ids: [1],
                entities: { 1: { id: 1, name: 'Old Name'} }
            };
            const updatedSource = { id: 1, name: 'Updated Name' };
            const action = { type: updateIncomeSource.fulfilled.type, payload: updatedSource };
            const stateAfter = incomeSourcesReducer(stateBefore, action);
            expect(stateAfter.entities[1]).toEqual(updatedSource);
            expect(stateAfter.loading).toBe('succeeded');
            expect(stateAfter.error).toBeNull();
        });

        it('should handle deleteIncomeSource.fulfilled', () => {
            const stateBefore = {
                ...initialState,
                ids: [1, 2],
                entities: { 1: { id: 1, name: 'Delete Me'}, 2: { id: 2, name: 'Keep Me'} }
            };
            const idToDelete = 1;
            const action = { type: deleteIncomeSource.fulfilled.type, payload: idToDelete };
            const stateAfter = incomeSourcesReducer(stateBefore, action);
            expect(stateAfter.ids).toEqual([2]);
            expect(stateAfter.entities[1]).toBeUndefined();
            expect(stateAfter.entities[2]).toBeDefined();
            expect(stateAfter.loading).toBe('succeeded');
            expect(stateAfter.error).toBeNull();
        });

        // Add tests for pending/rejected cases
    });
});
