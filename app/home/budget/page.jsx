// // app/home/budget/page.jsx
// 'use client'
// import React, { useState, useEffect } from 'react'; // Import useEffect
// import { useDispatch, useSelector } from 'react-redux';
// import CustomBarChart from "@/app/components/charts/bar-chart";
// import {
//     updateCategory,
//     selectCategoryById,
//     addCategory,
//     deleteCategory,
//     initializeStore,
//     selectAllCategories
// } from '../../store/financeSlice';
// import StatsOverview from '@/app/components/budget/stats-overview';
// import AddCategoryButton from '@/app/components/budget/add-category';
// import CategoryModal from '@/app/components/budget/category-modal';
// import CategoryList from '@/app/components/budget/category-list';
// import PageHeader from '@/app/components/generic/page-header';
// import NavigationLinks from '@/app/components/generic/navigation-links';


// export default function BudgetPage() {
//     const dispatch = useDispatch();
//     const categories = useSelector(selectAllCategories);
//     const currentMonthChartData = useSelector(state => state.finance.currentMonthChartData); // Keep
//     const currentMonthSummary = useSelector(state => state.finance.currentMonthSummary); // Keep
//     const isLoading = useSelector(state => state.finance.loading); // Correct loading
//     const fetchError = useSelector(state => state.finance.error); // Correct error
//     const isInitialized = useSelector(state => state.finance.isInitialized);

//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingCategory, setEditingCategory] = useState(null);
//     const [formData, setFormData] = useState({
//         name: '',
//         type: 'expense',
//         plannedAmount: '',
//     });

//     useEffect(() => {
//         if (!isInitialized) {
//             dispatch(initializeStore());
//         }
//     }, [dispatch, isInitialized]);


//     const getCategoryById = (id) => {
//       // Return category directly, useSelector handles updates.
//       return useSelector(state => selectCategoryById(state, id));
//     };

//     const handleFormChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//   const handleAddCategory = () => {
//     if (formData.name && formData.plannedAmount) {
//       const categoryData = {
//         name: formData.name,
//         type: formData.type,
//         plannedAmount: parseFloat(formData.plannedAmount),
//         id: Date.now() // Use proper unique ID generation in production
//       };

//       dispatch(addCategory(categoryData)); // Dispatch the action
//       closeModal();
//     }
//   };


//   const handleEditCategory = (categoryId) => {
//     const categoryToEdit = categories.find((cat) => cat.id === categoryId);
//       if (categoryToEdit) {
//         setFormData({
//           name: categoryToEdit.name,
//           type: categoryToEdit.type,
//           plannedAmount: categoryToEdit.plannedAmount.toString(), // Ensure string for input
//         });
//         setEditingCategory(categoryId);
//         setIsModalOpen(true);
//       }
//     };
//   const handleSaveCategory = () => {
//     if (editingCategory) {
//       const updatedCategory = {
//         id: editingCategory, // Include the ID
//         name: formData.name,
//         type: formData.type,
//         plannedAmount: parseFloat(formData.plannedAmount), // Convert to number
//         // No spentCurrentMonth here, it's derived
//       };
//       dispatch(updateCategory(updatedCategory)); // Dispatch update action
//     } else {
//       handleAddCategory(); // This will dispatch addCategory
//     }
//     closeModal();
//   };
//     const handleDeleteCategory = (categoryId) => {
//         dispatch(deleteCategory(categoryId)); // Dispatch delete action
//     };

//     const closeModal = () => {
//         setIsModalOpen(false);
//         setEditingCategory(null);
//         setFormData({ name: '', type: 'expense', plannedAmount: '' });
//     }

//     const today = new Date();
//     const monthName = today.toLocaleString('default', { month: 'long' });
//     const year = today.getFullYear();
//     const currentMonthYearLabel = `${monthName} ${year} Budget Overview`;

//     if (isLoading === 'pending') {
//         return <div className="flex justify-center items-center h-screen">Loading financial data...</div>;
//     }

//     if (fetchError) {
//         return <div className="flex justify-center items-center h-screen text-danger-primary">Error loading data: {fetchError}</div>;
//     }
//     const budgetPageLinks = [
//         { href: "/home", text: "View Home" },
//         { href: "/home/transactions", text: "View Transactions" },
//         { href: "/home/savings", text: "View Savings" },
//         { href: "/home/ai-chat", text: "AI Chat" },
//     ];

//     return (
//         <>
//             <PageHeader title="Budget Dashboard" subtitle={currentMonthYearLabel} />

//             {/* Chart Section (integrated back into main component) */}
//             <section className="mb-8">
//                 <CustomBarChart chartData={currentMonthChartData || []}/>
//             </section>

//             <StatsOverview currentMonthSummary={currentMonthSummary} />

//             <AddCategoryButton onClick={() => setIsModalOpen(true)} />

//             <CategoryModal
//                 isOpen={isModalOpen}
//                 onClose={closeModal}
//                 onSave={handleSaveCategory}
//                 formData={formData}
//                 onChange={handleFormChange}
//                 editingCategory={editingCategory}
//             />

//             <CategoryList
//                 categories={categories}
//                 getCategoryById={getCategoryById}
//                 onEdit={handleEditCategory}
//                 onDelete={handleDeleteCategory}
//             />
//             <NavigationLinks links={budgetPageLinks} />
//         </>
//     );
// }

import PageHeader from "@/app/components/generic/page-header";
import NotBuiltYet from '@/app/components/not-built-yet';

export default function tempPage() {
    return (
        <>
            <PageHeader title="Savings" subtitle="This feature is currently under construction."/>
          <NotBuiltYet />
        </>
    )
}