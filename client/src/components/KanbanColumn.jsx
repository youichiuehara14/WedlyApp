import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

const KanbanColumn = ({ id, tasks, onTaskClick }) => {
  // useDroppable hook creates a droppable area for drag-and-drop functionality
  // The 'id' passed to useDroppable is prefixed with "column-" to uniquely identify this column
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${id}`,
  });

  return (
    // This div is the droppable area where tasks can be dropped
    <div
      // 'setNodeRef' binds the column div to the droppable area, allowing it to accept dragged items
      ref={setNodeRef}
      // Conditional styling: if the column is being hovered by a dragged task, apply a blue border
      className={`bg-gray-100 p-4 rounded-lg w-full sm:w-80 flex-shrink-0 ${
        isOver ? 'border-2 border-blue-500' : 'border border-gray-200'
      }`}
    >
      {/* Title of the column, dynamically formatted by replacing camelCase with spaces */}
      <h2 className="text-xl font-semibold text-gray-700 mb-4 capitalize">
        {id.replace(/([A-Z])/g, ' $1').trim()}
      </h2>
      {/* List of task cards, displayed in the column */}
      <div className="space-y-2 max-h-[60vh] overflow-y-hidden">
        {/* Mapping through the tasks array to display each task as a TaskCard */}
        {tasks.map((task) => {
          // Ensure task.id exists and is unique
          if (!task._id) {
            console.error('Task is missing id:', task);
            return null; // Skip rendering if no id
          }

          return (
            <TaskCard
              key={task._id}
              id={task._id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default KanbanColumn;
