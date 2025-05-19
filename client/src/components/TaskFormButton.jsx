// a button that triggers to open CreateTaskModal
import { useState } from 'react';
import CreateTaskModal from './modals/CreateTaskModal';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
      >
        Create Task
      </button>
      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
