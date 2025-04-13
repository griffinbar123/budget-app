import { FiPlusCircle } from "react-icons/fi"


export default function AddCategoryButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="bg-success-primary hover:bg-success-primary/90 text-white font-bold py-2 px-4 rounded mb-4"
        >
            <FiPlusCircle className="inline-block mr-2" />
            Add Category
        </button>
    );
}