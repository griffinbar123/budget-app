// /app/components/transaction/TransactionTable.test.js
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TransactionTable from './transaction-table';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock Redux store and selectors needed by the component
const mockStore = configureStore([]);
const mockCategories = [
    { id: 1, name: 'Groceries', type: 'expense' },
    { id: 2, name: 'Gas', type: 'expense' },
];
const mockIncomeSources = [
    { id: 10, name: 'Salary' },
];
const initialState = {
    // Provide state structure expected by selectors used *within* TransactionTable
    categories: { ids: [1, 2], entities: { 1: mockCategories[0], 2: mockCategories[1] } },
    incomeSources: { ids: [10], entities: { 10: mockIncomeSources[0] } },
};

describe('<TransactionTable />', () => {
    let store;
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    const mockTransactions = [
        { id: 101, date: '2025-04-10', description: 'Grocery Store', categoryId: 1, sourceId: null, amount: -55.67, type: 'expense', category_id: 1, source_id: null }, // Corrected keys
        { id: 102, date: '2025-04-11', description: 'Paycheck', categoryId: null, sourceId: 10, amount: 2000.00, type: 'income', category_id: null, source_id: 10 },
        { id: 103, date: '2025-04-12', description: 'Gas Station', categoryId: 2, sourceId: null, amount: -42.11, type: 'expense', category_id: 2, source_id: null },
    ];

    beforeEach(() => {
        store = mockStore(initialState);
        mockOnEdit.mockClear();
        mockOnDelete.mockClear();
    });

    it('renders the table headers correctly', () => {
        render(
            <Provider store={store}>
                <TransactionTable transactions={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />
            </Provider>
        );
        expect(screen.getByRole('columnheader', { name: 'Date' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Description' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Category/Source' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Type' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument();
    });

    it('renders the correct number of transaction rows', () => {
        render(
            <Provider store={store}>
                <TransactionTable transactions={mockTransactions} onEdit={mockOnEdit} onDelete={mockOnDelete} />
            </Provider>
        );
        // Find rows within the tbody element
        const tableBody = screen.getByRole('table').querySelector('tbody');
        const rows = within(tableBody).getAllByRole('row');
        expect(rows).toHaveLength(mockTransactions.length);
    });

    it('displays transaction data correctly in a row', () => {
        render(
            <Provider store={store}>
                <TransactionTable transactions={[mockTransactions[0]]} onEdit={mockOnEdit} onDelete={mockOnDelete} />
            </Provider>
        );
        const row = screen.getByRole('row', { name: /Grocery Store/i }); // Find row by description

        // Use within to query inside the specific row
        expect(within(row).getByText('04/10/2025')).toBeInTheDocument(); // Check formatted date
        expect(within(row).getByText('Grocery Store')).toBeInTheDocument();
        expect(within(row).getByText('Groceries')).toBeInTheDocument(); // Check category name lookup
        expect(within(row).getByText('expense')).toBeInTheDocument();
        // Check amount formatting and sign
        const amountCell = within(row).getByText(/55.67/); 
        expect(amountCell).toBeInTheDocument();
        expect(amountCell).toHaveTextContent('-$55.67');
        expect(amountCell).toHaveClass('text-danger-primary');
    });

     it('displays income source correctly', () => {
        render(
            <Provider store={store}>
                <TransactionTable transactions={[mockTransactions[1]]} onEdit={mockOnEdit} onDelete={mockOnDelete} />
            </Provider>
        );
        const row = screen.getByRole('row', { name: /Paycheck/i });
        expect(within(row).getByText('Salary')).toBeInTheDocument(); // Check source name lookup
        const amountCell = within(row).getByText(/2,000.00/); 
        expect(amountCell).toBeInTheDocument();
        expect(amountCell).toHaveTextContent('+$2,000.00');
        expect(amountCell).toHaveClass('text-success-primary');
    });

    it('calls onEdit with the correct ID when Edit button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <Provider store={store}>
                <TransactionTable transactions={mockTransactions} onEdit={mockOnEdit} onDelete={mockOnDelete} />
            </Provider>
        );
        const row = screen.getByRole('row', { name: /Gas Station/i });
        const editButton = within(row).getByRole('button', { name: /Edit/i });

        await user.click(editButton);
        expect(mockOnEdit).toHaveBeenCalledTimes(1);
        expect(mockOnEdit).toHaveBeenCalledWith(103); // ID of the Gas Station transaction
    });

    it('calls onDelete with the correct ID when Delete button is clicked', async () => {
         const user = userEvent.setup();
         render(
            <Provider store={store}>
                <TransactionTable transactions={mockTransactions} onEdit={mockOnEdit} onDelete={mockOnDelete} />
            </Provider>
        );
        const row = screen.getByRole('row', { name: /Grocery Store/i });
        const deleteButton = within(row).getByRole('button', { name: /Delete/i });

        await user.click(deleteButton);
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
        expect(mockOnDelete).toHaveBeenCalledWith(101); // ID of the Grocery Store transaction
    });

    it('displays a message when no transactions are provided', () => {
        render(
            <Provider store={store}>
                <TransactionTable transactions={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />
            </Provider>
        );
        expect(screen.getByText(/No transactions match/i)).toBeInTheDocument();
    });
});
