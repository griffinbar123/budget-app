// /app/components/transaction/TransactionFilters.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TransactionFilters from './transaction-filters';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock Redux store and selectors
const mockStore = configureStore([]);
const mockCategories = [
    { id: 1, name: 'Groceries', type: 'expense' },
    { id: 2, name: 'Gas', type: 'expense' },
];
const mockIncomeSources = [
    { id: 10, name: 'Salary' },
];
const initialState = {
    categories: { ids: [1, 2], entities: { 1: mockCategories[0], 2: mockCategories[1] } },
    incomeSources: { ids: [10], entities: { 10: mockIncomeSources[0] } },
};

describe('<TransactionFilters />', () => {
    let store;
    const mockOnFilterChange = jest.fn();
    const mockOnSearchChange = jest.fn();
    const mockOnSortChange = jest.fn();

    const defaultProps = {
        filterCategory: 'all',
        searchQuery: '',
        sortBy: 'date-desc',
        onFilterChange: mockOnFilterChange,
        onSearchChange: mockOnSearchChange,
        onSortChange: mockOnSortChange,
    };

    beforeEach(() => {
        store = mockStore(initialState);
        mockOnFilterChange.mockClear();
        mockOnSearchChange.mockClear();
        mockOnSortChange.mockClear();
    });

    it('renders inputs and dropdowns with initial values', () => {
        render(
            <Provider store={store}>
                <TransactionFilters {...defaultProps} />
            </Provider>
        );
        expect(screen.getByPlaceholderText(/Search descriptions/i)).toHaveValue('');
        expect(screen.getByLabelText(/Filter by Category or Source/i)).toHaveValue('all');
        expect(screen.getByLabelText(/Sort transactions/i)).toHaveValue('date-desc');
        // Check dropdowns are populated
        expect(screen.getByRole('option', { name: 'Groceries' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Income: Salary' })).toBeInTheDocument();
    });

    it('calls onSearchChange when search input changes', async () => {
        const user = userEvent.setup();
        render(
            <Provider store={store}>
                <TransactionFilters {...defaultProps} />
            </Provider>
        );
        const searchInput = screen.getByPlaceholderText(/Search descriptions/i);
        await user.type(searchInput, 'test search');
        // Check the mock function passed in props was called
        expect(mockOnSearchChange).toHaveBeenCalled();
        // The exact number of calls depends on implementation details of user.type
        // expect(mockOnSearchChange).toHaveBeenCalledTimes(11); // Example if called per character
    });

    it('calls onFilterChange when category/source dropdown changes', async () => {
        const user = userEvent.setup();
        render(
            <Provider store={store}>
                <TransactionFilters {...defaultProps} />
            </Provider>
        );
        const filterSelect = screen.getByLabelText(/Filter by Category or Source/i);
        // Select category 'Gas' which has value '2'
        await user.selectOptions(filterSelect, '2'); 
        expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
        // You could also check the event object passed if needed
    });

     it('calls onSortChange when sort dropdown changes', async () => {
        const user = userEvent.setup();
        render(
            <Provider store={store}>
                <TransactionFilters {...defaultProps} />
            </Provider>
        );
        const sortSelect = screen.getByLabelText(/Sort transactions/i);
        await user.selectOptions(sortSelect, 'amount-desc');
        expect(mockOnSortChange).toHaveBeenCalledTimes(1);
    });
});
