// /app/components/budget/BudgetCategory.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BudgetCategory from './budget-category';


describe('<BudgetCategory />', () => {

    const mockExpenseCat = {
        id: 1,
        name: 'Groceries',
        type: 'expense',
        planned_amount: 300,
    };

    const mockReserveCat = {
        id: 2,
        name: 'Vacation Fund',
        type: 'reserve',
        planned_amount: 500,
    };

    it('renders expense category name and amounts correctly (under budget)', () => {
        const spent = 150.75;
        render(<BudgetCategory budgetCat={mockExpenseCat} spentAmount={spent} />);

        expect(screen.getByRole('heading', { name: mockExpenseCat.name })).toBeInTheDocument();
        // Check the text displaying spent vs planned
        expect(screen.getByText(`Spent: $${spent.toFixed(2)} / $${mockExpenseCat.planned_amount.toFixed(2)}`)).toBeInTheDocument();
        // Check progress bar exists using the added role
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
        // Check the inner div for color / style
        expect(progressBar.firstChild).toHaveClass('bg-accent-primary');
        expect(progressBar.firstChild).not.toHaveClass('bg-danger-primary');
        // Check '(Savings Goal)' text is NOT present
        expect(screen.queryByText('(Savings Goal)')).not.toBeInTheDocument();
    });

     it('renders reserve category name and amounts correctly', () => {
        const spent = 200;
        render(<BudgetCategory budgetCat={mockReserveCat} spentAmount={spent} />);

        // FIX: Use regex or function to find heading because of nested span
        expect(screen.getByRole('heading', { name: /Vacation Fund/i })).toBeInTheDocument();
        // END FIX
        
        expect(screen.getByText(`Allocated: $${spent.toFixed(2)} / $${mockReserveCat.planned_amount.toFixed(2)}`)).toBeInTheDocument();
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
        expect(progressBar.firstChild).toHaveClass('bg-accent-primary');
        // Check '(Savings Goal)' text IS present
        expect(screen.getByText('(Savings Goal)')).toBeInTheDocument();
    });

    it('shows danger color on progress bar when over budget', () => {
        const spent = 350; // Over budget (planned is 300)
        render(<BudgetCategory budgetCat={mockExpenseCat} spentAmount={spent} />);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar.firstChild).toHaveClass('bg-danger-primary');
        expect(progressBar.firstChild).not.toHaveClass('bg-accent-primary');
        expect(progressBar.firstChild).toHaveStyle('width: 100%');
    });

    it('handles zero planned amount gracefully', () => {
        const zeroPlannedCat = { ...mockExpenseCat, planned_amount: 0 };
        const spent = 50;
        render(<BudgetCategory budgetCat={zeroPlannedCat} spentAmount={spent} />);
        
        expect(screen.getByText(`Spent: $${spent.toFixed(2)} / $${(0).toFixed(2)}`)).toBeInTheDocument();
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar.firstChild).toHaveClass('bg-danger-primary'); // Because spent > 0 and planned is 0
        expect(progressBar.firstChild).toHaveStyle('width: 100%'); // Caps at 100%
    });

    it('renders nothing if budgetCat prop is missing', () => {
       const { container } = render(<BudgetCategory budgetCat={null} spentAmount={100} />);
       expect(container).toBeEmptyDOMElement();
    });

     it('calculates and displays progress width correctly (e.g., 50%)', () => {
        const spent = 150;
        render(<BudgetCategory budgetCat={mockExpenseCat} spentAmount={spent} />); // 150 / 300 = 50%
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar.firstChild).toHaveStyle('width: 50%');
        expect(progressBar.firstChild).toHaveClass('bg-accent-primary');
    });
});
