import { FiPlusCircle as PlusIcon } from "react-icons/fi";

export default function AddTransactionButton({ onAdd }) {
  return (
      <button
          onClick={onAdd}
          className="bg-success-primary text-text-primary py-2 px-4 rounded-lg hover:bg-success-primary/90 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center mb-4"
      >
          <PlusIcon className="w-5 h-5" />
          Add New Transaction
      </button>
  );
}