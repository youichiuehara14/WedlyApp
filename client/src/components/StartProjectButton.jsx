import { useState } from 'react';
import { Plus } from 'lucide-react';
import StartProjectFormModal from './modals/StartProjectFormModal';

export default function StartProjectButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex border-1 text-white text-[14px] w-40 h-10 justify-center sm:text-base  border-[#94949498] duration-200 hover:bg-[#46493a] rounded cursor-pointer items-center"
        aria-label="Create a new project"
      >
        <Plus size={20} strokeWidth={3} />
        Create Board
      </button>

      {isOpen && <StartProjectFormModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
