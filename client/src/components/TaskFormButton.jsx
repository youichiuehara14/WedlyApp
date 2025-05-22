// a button that triggers to open CreateTaskModal
import { useState } from 'react';
import CreateTaskModal from './modals/CreateTaskModal';

const TaskFormButton = ({ onTaskCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // bg-[#2d2f25]
  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-30 py-2 border-1 text-white border-[#dddddd2d] duration-200 hover:bg-[#323529]  rounded cursor-pointer"
      >
        Create Task
      </button>
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={() => {
          if (onTaskCreated) {
            onTaskCreated();
          }
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default TaskFormButton;
