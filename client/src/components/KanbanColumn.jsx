import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

const KanbanColumn = ({ id, tasks, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`p-5 sm:p-3 md:p-5 rounded-lg w-full flex-shrink-0 flex flex-col mb-10 ${
        isOver
          ? ' border-gray-600 shadow-neumorphism-inset'
          : ' border-[#4e4e4e7e] shadow-neumorphism-inset'
      }`}
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 capitalize text-white">
        {id.replace(/([A-Z])/g, ' $1').trim()}
      </h2>
      <div className="flex-1 space-y-2 w-full px-1 sm:px-2 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
        {tasks.map((task) => {
          if (!task._id) {
            console.error('Task is missing id:', task);
            return null;
          }

          return (
            <TaskCard key={task._id} id={task._id} task={task} onClick={() => onTaskClick(task)} />
          );
        })}
      </div>
    </div>
  );
};

export default KanbanColumn;
