import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function StartProjectButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center bg-blue-600 text-white text-lg rounded-lg cursor-pointer px-3 py-2 font-medium gap-1 hover:bg-blue-700"
        aria-label="Create a new project"
      >
        <Plus size={20} strokeWidth={3} />
        Create Project
      </button>

      {isOpen && <StartProjectModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
