// TaskCard renders a task with drag-and-drop functionality and handles click events.

import { useSortable } from '@dnd-kit/sortable';
import { getDragStyle } from '../utils/dragStyle.js'; //  for dragging style only
import { colorToHex } from '../utils/colorMap.js';

const TaskCard = ({ task, id, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: id,
  });

  const hexColor = colorToHex[task.taskColor] || '#D1D5DB';

  const style = getDragStyle(transform, transition, isDragging);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick && onClick(task)}
      className="bg-white p-4 mb-3 rounded-lg shadow-lg hover:shadow-xl cursor-pointer"
    >
      <div className="w-5 h-1" style={{ backgroundColor: hexColor }}></div>
      <p className="text-gray-800 font-semibold">{task.title}</p>
    </div>
  );
};

export default TaskCard;
