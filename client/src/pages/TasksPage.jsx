import { useContext } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import { Context } from '../Context';

function TasksPage() {
  const { activeBoardObject } = useContext(Context);
  return (
    <>
      {activeBoardObject ? (
        <>
          <div className="bg-[#2d2f25] rounded-4xl shadow-neumorphism-inset">
            <KanbanBoard />
          </div>
        </>
      ) : (
        <div className="text-gray-500 text-sm">Please select a board to view tasks.</div>
      )}
    </>
  );
}

export default TasksPage;
