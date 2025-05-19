import { useState, useEffect } from 'react'; //
import axios from 'axios';
import {
  DndContext, // Drag and Drop Context to manage drag events
  rectIntersection, // Collision detection for dragging
  MouseSensor, // Mouse event sensor
  TouchSensor, // Touch event sensor
  useSensor, // Custom hook to use sensors
  useSensors, // Custom hook to handle multiple sensors
  DragOverlay, // A component to show a dragged item
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'; // Sorting context and strategy
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard'; // Task card component
import TaskModal from './modals/TaskModal'; // Task full detail modal component

const KanbanBoard = ({ boardId }) => {
  // State for columns (todo, inProgress, done), active task, and selected task
  const [columns, setColumns] = useState({ todo: [], inProgress: [], done: [] });
  // the 'activeTask' state keeps track of the task that is currently being dragged.
  const [activeTask, setActiveTask] = useState(null);
  // The 'selectedTask' state holds the task that has been clicked on for viewing/editing.
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch tasks from API when boardId changes
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Get tasks from the server using boardId
        const response = await axios.get(`http://localhost:4000/api/task/board/${boardId}`, {
          withCredentials: true, // Include credentials (cookies, etc.)
        });
        const { tasks } = response.data;

        // Group tasks by their status (To Do, In Progress, Done)
        const grouped = { todo: [], inProgress: [], done: [] };
        tasks.forEach((task) => {
          // Format the task data to include necessary fields
          const formattedTask = {
            id: task._id,
            title: task.title,
            description: task.description,
            vendor: task.vendor?._id?.toString() || task.vendor || '', // Handle vendor ID
            vendorName: task.vendor?.name || task.vendor || '',
            category: task.category,
            cost: task.cost,
            dueDate: task.dueDate,
            status: task.status,
            taskColor: task.taskColor,
            priority: task.priority,
            position: task.position,
          };

          // Add tasks to respective status categories
          if (task.status === 'To Do') grouped.todo.push(formattedTask);
          else if (task.status === 'In Progress') grouped.inProgress.push(formattedTask);
          else if (task.status === 'Done') grouped.done.push(formattedTask);
        });

        setColumns(grouped); // Update state with grouped tasks
      } catch (error) {
        console.error('Failed to fetch tasks:', error); // Log any error
      }
    };

    fetchTasks(); // Call the fetchTasks function
  }, [boardId]); // Trigger this effect when the boardId changes

  // Set up drag-and-drop sensors (for mouse and touch events)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }), // Mouse sensor with a 5px activation threshold
    useSensor(TouchSensor) // Touch sensor for mobile devices
  );

  // Helper function to find the task and column based on task ID
  const findTaskAndColumn = (id) => {
    for (const [columnId, tasks] of Object.entries(columns)) {
      const task = tasks.find((t) => t.id === id);
      if (task) return { task, columnId };
    }
    return null;
  };

  // Handle the start of a drag event
  const handleDragStart = (event) => {
    const { active } = event;
    const found = findTaskAndColumn(active.id); // Find the task being dragged
    if (found) {
      setActiveTask({ ...found.task, columnId: found.columnId }); // Set the active task
    }
  };

  // Handle the end of a drag event
  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null); // Reset active task

    if (!over) return; // If no task is over, do nothing

    const activeId = active.id;
    const overId = over.id;

    const activeTaskInfo = findTaskAndColumn(activeId); // Get task info for the dragged task
    const overTaskInfo = findTaskAndColumn(overId); // Get task info for the dropped task

    const overIsColumn = overId.startsWith('column-'); // Check if the drop target is a column
    const targetColumnId = overIsColumn ? overId.replace('column-', '') : overTaskInfo?.columnId; // Determine the target column

    if (!activeTaskInfo || !targetColumnId) return; // If no valid task or column, return

    const fromColumnId = activeTaskInfo.columnId;
    const taskData = activeTaskInfo.task;

    // Map column IDs to task statuses
    const statusMap = {
      todo: 'To Do',
      inProgress: 'In Progress',
      done: 'Done',
    };

    // Reordering task within the same column
    if (fromColumnId === targetColumnId) {
      const oldIndex = columns[fromColumnId].findIndex((t) => t.id === activeId);
      const newIndex = overIsColumn ? 0 : columns[targetColumnId].findIndex((t) => t.id === overId);
      setColumns((prev) => ({
        ...prev,
        [targetColumnId]: arrayMove(prev[targetColumnId], oldIndex, newIndex), // Move task within the column
      }));
    } else {
      // Moving task to a different column
      const newStatus = statusMap[targetColumnId]; // Get new status based on column

      // Validate task data
      if (!taskData.vendor || !taskData.vendor.match(/^[0-9a-fA-F]{24}$/)) {
        alert('Invalid vendor ID. Please update the vendor in the database.');
        return;
      }

      if (!taskData.title || !taskData.description) {
        alert('Missing title or description.');
        return;
      }

      // Optimistically update frontend state
      const newColumns = {
        ...columns,
        [fromColumnId]: columns[fromColumnId].filter((t) => t.id !== activeId), // Remove task from the original column
        [targetColumnId]: [
          ...columns[targetColumnId].slice(
            0,
            overIsColumn ? 0 : columns[targetColumnId].findIndex((t) => t.id === overId)
          ),
          { ...taskData, status: newStatus }, // Add task to the target column with new status
          ...columns[targetColumnId].slice(
            overIsColumn ? 0 : columns[targetColumnId].findIndex((t) => t.id === overId)
          ),
        ],
      };
      setColumns(newColumns); // Update columns state

      // Make API call to update task status in the backend
      try {
        const updatedTaskData = {
          title: taskData.title,
          description: taskData.description,
          taskColor: taskData.taskColor || 'red',
          dueDate: taskData.dueDate || null,
          status: newStatus,
          priority: taskData.priority || 'Medium',
          position: taskData.position || 0,
          vendor: taskData.vendor,
        };

        await axios.put(
          `http://localhost:4000/api/task/update-task/${activeId}`,
          updatedTaskData, // Send updated task data
          { withCredentials: true }
        );
      } catch (error) {
        // Revert task change if API call fails
        setColumns((prev) => ({
          ...prev,
          [fromColumnId]: [...prev[fromColumnId], { ...taskData, status: statusMap[fromColumnId] }],
          [targetColumnId]: prev[targetColumnId].filter((t) => t.id !== activeId),
        }));
        alert('Failed to update task status: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <>
      <h1>Current Board Id (just for checking): {boardId}</h1>

      {/* Drag and Drop Context for managing drag events */}
      <DndContext
        sensors={sensors} // Use mouse and touch sensors
        collisionDetection={rectIntersection} // Detect intersection for drop events
        onDragStart={handleDragStart} // Triggered when drag starts
        onDragEnd={handleDragEnd} // Triggered when drag ends
      >
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          {/* Map through columns and display each Kanban column */}
          {Object.keys(columns).map((columnId) => (
            <SortableContext
              key={columnId}
              items={columns[columnId].map((task) => task.id)} // Task IDs for sorting
              strategy={verticalListSortingStrategy} // Sorting strategy
            >
              <KanbanColumn
                id={columnId}
                tasks={columns[columnId]}
                onTaskClick={(task) => setSelectedTask(task)} // Set selected task on click
              />
            </SortableContext>
          ))}
        </div>

        {/* Overlay for showing the task being dragged */}
        <DragOverlay>
          {activeTask ? (
            <div className="w-72">
              <TaskCard task={activeTask} id={activeTask.id} /> {/* Display dragged task */}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modal to show task details */}
      {selectedTask && <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </>
  );
};

export default KanbanBoard;
