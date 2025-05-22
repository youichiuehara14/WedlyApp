import { useState } from 'react';
import { Plus } from 'lucide-react';
import StartProjectFormModal from './modals/StartProjectFormModal';

export default function StartProjectButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex py-2 px-4 border-1 text-black border-[#94949498] duration-200 hover:bg-[#f3f3f3] rounded cursor-pointer items-center"
        aria-label="Create a new project"
      >
        <Plus size={20} strokeWidth={3} />
        Create Board
      </button>

      {isOpen && <StartProjectFormModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
