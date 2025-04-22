// /app/home/budget/page.jsx
'use client'
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Import Actions and Selectors from CORRECT Slices
import {
    addCategory,
    updateCategory,
    deleteCategory,
    selectAllCategories, // Gets the list of categories
    selectCurrentMonthChartData, // For the bar chart
    selectCurrentMonthSummary, // For the stats overview
    // selectCategoryById // No longer needed here if passing objects
} from '../../store/categoriesSlice'; // Path to your categories slice

// Import Components
import CustomBarChart from "@/app/components/charts/bar-chart";
import StatsOverview from '@/app/components/budget/stats-overview';
import AddCategoryButton from '@/app/components/budget/add-category';
import CategoryModal from '@/app/components/budget/category-modal';
import CategoryList from '@/app/components/budget/category-list';
import PageHeader from '@/app/components/generic/page-header';
import NavigationLinks from '@/app/components/generic/navigation-links';

// Initial state for the category form modal
const initialFormData = {
    name: '',
    type: 'expense', // Default to expense
    plannedAmount: '',
};

export default function BudgetPage() {
    const dispatch = useDispatch();

    // --- Selectors ---
    // Get data directly from the store
    const categories = useSelector(selectAllCategories);
    const currentMonthChartData = useSelector(selectCurrentMonthChartData);
    const currentMonthSummary = useSelector(selectCurrentMonthSummary);

    // Get loading/error states primarily from categories slice
    const categoriesLoading = useSelector(state => state.categories.loading);
    const categoriesError = useSelector(state => state.categories.error);
    // You might add transaction loading/error if StatsOverview/Chart heavily depend on transaction status
    // const transactionsLoading = useSelector(state => state.transactions.loading);
    // const transactionsError = useSelector(state => state.transactions.error);

    // --- State for Modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null); // Stores the category object being edited, or null if adding
    const [formData, setFormData] = useState(initialFormData);

    // --- Modal and Form Handlers ---
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            // Keep plannedAmount as string for input field control, convert on save
            [name]: value,
        }));
    };

    const openAddModal = () => {
        setEditingCategory(null); // Ensure not in edit mode
        setFormData(initialFormData); // Reset form
        setIsModalOpen(true);
    };

    const openEditModal = (categoryId) => {
        // Find the category object from the Redux state using the ID
        const categoryToEdit = categories.find(cat => cat.id === categoryId);
        if (categoryToEdit) {
            setEditingCategory(categoryToEdit); // Store the category object
            setFormData({ // Pre-fill form
                name: categoryToEdit.name,
                type: categoryToEdit.type,
                // Convert number to string for the input field, handle null/undefined
                plannedAmount: categoryToEdit.planned_amount?.toString() ?? '',
            });
            setIsModalOpen(true);
        } else {
            console.error("Category not found for editing:", categoryId);
            // Optionally set an error state to show feedback
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null); // Clear editing state
        setFormData(initialFormData); // Reset form
    };

    const handleSaveCategory = () => {
        // Basic validation
        const plannedAmountParsed = parseFloat(formData.plannedAmount);
        if (!formData.name.trim() || isNaN(plannedAmountParsed)) {
            // Basic validation: name not empty, plannedAmount is a number
            // You might want more sophisticated validation feedback
            console.error("Invalid form data - Name and valid Planned Amount required");
            alert("Please enter a valid category name and planned amount."); // Simple feedback
            return;
        }

        const categoryData = {
            name: formData.name.trim(), // Trim whitespace
            type: formData.type,
            plannedAmount: plannedAmountParsed, // Use parsed number
        };

        if (editingCategory) {
            // Prevent saving if trying to change 'Uncategorized' name (UI should disable input, but add check here too)
            if (editingCategory.name === 'Uncategorized' && categoryData.name !== 'Uncategorized') {
                console.error("Attempted to rename 'Uncategorized' category.");
                alert("The 'Uncategorized' category name cannot be changed."); // User feedback
                // Don't close modal, let them fix it or cancel
                return;
            }
            // Dispatch update action with ID and updated data
            dispatch(updateCategory({ ...categoryData, id: editingCategory.id }));
        } else {
            // Dispatch add action - API/Thunk should handle ID generation
            // Check for duplicate names is handled by the API route now
            dispatch(addCategory(categoryData));
        }
        closeModal(); // Close modal on successful dispatch initiation
    };

    const handleDeleteCategory = (categoryId) => {
        // UI should prevent calling this for 'Uncategorized' via button visibility
        // Backend API also prevents it
        if (window.confirm("Are you sure you want to delete this category? Associated transactions will need manual recategorization.")) {
            dispatch(deleteCategory(categoryId));
        }
    };

    // --- Loading and Error States ---
    // Combine loading/error states if depending on multiple slices
    const isLoading = categoriesLoading === 'pending'; // || transactionsLoading === 'pending';
    const fetchError = categoriesError; // || transactionsError;

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen text-text-primary">Loading budget data...</div>;
    }

    if (fetchError) {
        return <div className="flex flex-col justify-center items-center h-screen text-danger-primary">
                   <p>Error loading data:</p>
                   <p>{fetchError}</p>
               </div>;
    }

    // --- Page Info ---
    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();
    const currentMonthYearLabel = `${monthName} ${year} Budget`;

    const budgetPageLinks = [
        { href: "/home", text: "View Home" },
        { href: "/home/transactions", text: "View Transactions" },
        { href: "/home/savings", text: "View Savings" }, // Keep link
        { href: "/home/ai-chat", text: "AI Chat" },
    ];

    // --- Render ---
    return (
        <>
            <PageHeader title="Budget Management" subtitle={currentMonthYearLabel} />

            {/* Chart Section */}
            <section className="mb-8 px-4 sm:px-6 md:px-8 lg:px-10">
                {/* Ensure chartData is passed correctly */}
                <CustomBarChart chartData={currentMonthChartData || []} />
            </section>

            {/* Stats Overview */}
            {/* Ensure StatsOverview uses data from selectCurrentMonthSummary */}
            <StatsOverview currentMonthSummary={currentMonthSummary} />

            {/* Add Category Button */}
            <div className="px-4 sm:px-6 md:px-8 lg:px-10 mb-4">
                <AddCategoryButton onClick={openAddModal} />
            </div>

            {/* Category List - Pass categories array and handlers */}
            <section className="mb-8 px-4 sm:px-6 md:px-8 lg:px-10">
                 <CategoryList
                    categories={categories || []} // Pass the array from selector
                    onEdit={openEditModal} // Pass the edit handler
                    onDelete={handleDeleteCategory} // Pass the delete handler
                />
            </section>

            {/* Modal - Conditionally rendered */}
            <CategoryModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSaveCategory}
                formData={formData}
                onChange={handleFormChange}
                // Pass boolean indicating if editing
                editingCategory={!!editingCategory}
                // Conditionally disable name based on the category being edited
                isNameDisabled={editingCategory?.name === 'Uncategorized'} // Pass prop
            />

            <NavigationLinks links={budgetPageLinks} />
        </>
    );
}