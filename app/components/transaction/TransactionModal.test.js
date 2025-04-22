// /app/components/transaction/TransactionModal.test.js
import React from 'react';
// Import fireEvent along with render and screen
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TransactionModal from './transaction-modal'; // Assuming PascalCase filename, adjust if needed
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store'; // Ensure installed

// Mock Redux store setup
const mockStore = configureStore([]);
const mockCategories = [
    { id: 1, name: 'Groceries', type: 'expense' },
    { id: 2, name: 'Gas', type: 'expense' },
    { id: 3, name: 'Uncategorized', type: 'expense' },
];
const mockIncomeSources = [
    { id: 10, name: 'Salary' },
    { id: 11, name: 'Freelance' },
];

// Realistic initial state matching the structure your selectors expect
const initialState = {
    categories: {
        ids: [1, 2, 3],
        entities: { 1: mockCategories[0], 2: mockCategories[1], 3:mockCategories[2] },
        loading: 'idle',
        error: null
    },
    incomeSources: {
        ids: [10, 11],
        entities: { 10: mockIncomeSources[0], 11: mockIncomeSources[1] },
        loading: 'idle',
        error: null
    },
    // Include other root state slices if absolutely necessary for this component's selectors
};


describe('<TransactionModal />', () => {
    let store;
    // Mock functions for props
    const mockOnClose = jest.fn();
    const mockOnSave = jest.fn();
    const mockOnChange = jest.fn();

    // Reset mocks and store before each test
    beforeEach(() => {
        store = mockStore(initialState);
        mockOnClose.mockClear();
        mockOnSave.mockClear();
        mockOnChange.mockClear();
    });

    // Default props setup for convenience
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSave: mockOnSave,
        formData: { date: '2025-04-13', description: '', categoryId: '', sourceId: '', amount: '', type: 'expense' }, // Use a consistent date format
        onChange: mockOnChange,
        editingTransactionId: null,
    };

    it('renders correctly when adding a new transaction', () => {
        render(
            <Provider store={store}>
                <TransactionModal {...defaultProps} />
            </Provider>
        );

        expect(screen.getByRole('heading', { name: 'Add Transaction' })).toBeInTheDocument();
        expect(screen.getByLabelText('Date')).toBeInTheDocument();
        expect(screen.getByLabelText('Type')).toHaveValue('expense');
        expect(screen.getByLabelText('Category')).toBeInTheDocument(); // Category shown for expense
        expect(screen.queryByLabelText('Income Source')).not.toBeInTheDocument(); // Source hidden
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
        expect(screen.getByLabelText('Amount')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add Transaction' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();

        // Check if category dropdown is populated
        expect(screen.getByRole('option', { name: '-- Select Category --' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /Groceries/ })).toBeInTheDocument(); // Match partial text
        expect(screen.getByRole('option', { name: /Gas/ })).toBeInTheDocument();
    });

    it('renders correctly when editing an expense transaction', () => {
        const editProps = {
            ...defaultProps,
            editingTransactionId: 123,
            // Ensure data matches input types (amount as string initially)
            formData: { date: '2025-04-10', description: 'Edit Test', categoryId: '2', sourceId: '', amount: '55.50', type: 'expense' },
        };
        render(
            <Provider store={store}>
                <TransactionModal {...editProps} />
            </Provider>
        );

        expect(screen.getByRole('heading', { name: 'Edit Transaction' })).toBeInTheDocument();
        expect(screen.getByLabelText('Date')).toHaveValue('2025-04-10');
        expect(screen.getByLabelText('Description')).toHaveValue('Edit Test');
        // Input type number treats value as number for assertion
        expect(screen.getByLabelText('Amount')).toHaveValue(55.50);
        expect(screen.getByLabelText('Category')).toHaveValue('2'); // Should select Gas
        expect(screen.queryByLabelText('Income Source')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });

     it('renders correctly when adding an income transaction', () => {
         const incomeProps = {
             ...defaultProps,
             formData: { ...defaultProps.formData, type: 'income' },
         };
        render(
            <Provider store={store}>
                <TransactionModal {...incomeProps} />
            </Provider>
        );

        expect(screen.getByLabelText('Type')).toHaveValue('income');
        expect(screen.queryByLabelText('Category')).not.toBeInTheDocument(); // Category hidden
        expect(screen.getByLabelText('Income Source')).toBeInTheDocument(); // Source shown

        // Check if source dropdown is populated
        expect(screen.getByRole('option', { name: '-- Select Income Source --' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /Salary/ })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /Freelance/ })).toBeInTheDocument();
    });

    it('calls onChange prop when an input value changes', async () => {
        const user = userEvent.setup();
        render(
            <Provider store={store}>
                <TransactionModal {...defaultProps} />
            </Provider>
        );

        const descriptionInput = screen.getByLabelText('Description');
        await user.type(descriptionInput, 'New stuff');

        // Check if the onChange prop passed to the component was called
        expect(mockOnChange).toHaveBeenCalled();
        // Check the event object type if needed (less common)
        // expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'change' }));
    });

    it('calls onClose prop when Cancel button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <Provider store={store}>
                <TransactionModal {...defaultProps} />
            </Provider>
        );

        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    // --- UPDATED TEST USING fireEvent.submit ---
    it('calls onSave prop when form is submitted with valid data', async () => {
        const user = userEvent.setup();
        const initialValidProps = {
           ...defaultProps,
           // Ensure formData passed matches the required fields for validation check in handleSave
           formData: { date: '2025-04-13', description: '', categoryId: '', sourceId: '', amount: '', type: 'expense' },
        };
        render(
           <Provider store={store}>
               <TransactionModal {...initialValidProps} />
           </Provider>
       );

       // Fill required fields before submitting
       await user.type(screen.getByLabelText('Description'), 'Valid Item');
       await user.type(screen.getByLabelText('Amount'), '25.99');
       await user.selectOptions(screen.getByLabelText('Category'), '1'); // Select category with value '1'

       // Find the form using the data-testid added to the component
       const formElement = screen.getByTestId('transaction-modal-form');
       expect(formElement).toBeInTheDocument(); // Verify form found

       // Use fireEvent.submit on the form itself
       fireEvent.submit(formElement);

       // Now expect onSave to have been called by the form's onSubmit
       expect(mockOnSave).toHaveBeenCalledTimes(1);
    });
    // --- END UPDATED TEST CASE ---

    it('does not render when isOpen is false', () => {
        const closedProps = { ...defaultProps, isOpen: false };
        const { container } = render(
            <Provider store={store}>
                <TransactionModal {...closedProps} />
            </Provider>
        );
        // Check if the component renders nothing (or its top-level portal/div is absent)
        expect(container.firstChild).toBeNull();
    });
});