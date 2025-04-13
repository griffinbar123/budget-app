import BudgetCategoryWithEdit from "./edit-category";

export default function CategoryList({ categories, getCategoryById, onEdit, onDelete }) { 
    return (
        <section className="mb-8 ">
            <h2 className="text-lg font-semibold mb-4 text-text-primary">
                Category Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories?.map((category) => (
                    <BudgetCategoryWithEdit 
                        key={category.id}
                        budgetCat={category}
                        getCategoryById={getCategoryById}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </section>
    );
}