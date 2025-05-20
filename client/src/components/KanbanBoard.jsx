import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  DndContext,
  rectIntersection,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import TaskModal from './modals/TaskModal';
import { Context } from '../Context';

const KanbanBoard = () => {
  const { activeBoardObject, tasksPerBoard, setTasksPerBoard } =
    useContext(Context);
  const [columns, setColumns] = useState({
    todo: [],
    inProgress: [],
    done: [],
  });
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (!activeBoardObject._id) return;
    if (!tasksPerBoard) return;

    const grouped = { todo: [], inProgress: [], done: [] };
    if (!tasksPerBoard?.tasks) return;

    tasksPerBoard.tasks.forEach((task) => {
      const formattedTask = {
        id: task._id,
        _id: task._id,
        title: task.title,
        description: task.description,
        vendor: task.vendor?._id?.toString() || task.vendor || '',
        vendorName: task.vendor?.name || task.vendor || '',
        category: task.category,
        cost: task.cost,
        checklists: task.checklists,
        comments: task.comments,
        dueDate: task.dueDate,
        status: task.status,
        taskColor: task.taskColor,
        priority: task.priority,
        position: task.position,
      };

      if (task.status === 'To Do') grouped.todo.push(formattedTask);
      else if (task.status === 'In Progress')
        grouped.inProgress.push(formattedTask);
      else if (task.status === 'Done') grouped.done.push(formattedTask);
    });

    setColumns(grouped);
  }, [tasksPerBoard]);

  const handleUpdateTask = (updatedTask) => {
    console.log('Updating task:', updatedTask);
    setColumns((prev) => {
      const newColumns = { ...prev };

      // Remove the task from all columns using _id
      for (const columnId in prev) {
        newColumns[columnId] = prev[columnId].filter(
          (task) => task._id !== updatedTask._id
        );
      }

      // Add it to the correct column
      if (updatedTask.status === 'To Do') {
        newColumns.todo = [...newColumns.todo, updatedTask];
      } else if (updatedTask.status === 'In Progress') {
        newColumns.inProgress = [...newColumns.inProgress, updatedTask];
      } else if (updatedTask.status === 'Done') {
        newColumns.done = [...newColumns.done, updatedTask];
      }

      return newColumns;
    });

    // update the taskPerBoard in context
    setTasksPerBoard((prev) => {
      const newTasks = prev.tasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      );
      return { ...prev, tasks: newTasks };
    });
  };

  const handleDeleteTask = (taskId) => {
    setColumns((prev) => {
      const newColumns = {};
      for (const [columnId, tasks] of Object.entries(prev)) {
        newColumns[columnId] = tasks.filter((task) => task.id !== taskId);
      }
      return newColumns;
    });
    setTasksPerBoard((prev) => {
      const newTasks = prev.tasks.filter((task) => task._id !== taskId);
      return { ...prev, tasks: newTasks };
    });
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  const findTaskAndColumn = (id) => {
    // First try to match the full columnId-taskId format
    for (const [columnId, tasks] of Object.entries(columns)) {
      const task = tasks.find(
        (t) => t._id === id || `${columnId}-${t._id}` === id
      );
      if (task) return { task, columnId };
    }
    return null;
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const found = findTaskAndColumn(active.id);
    if (found) {
      setActiveTask({ ...found.task, columnId: found.columnId });
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find tasks using _id instead of id
    const activeTaskInfo = findTaskAndColumn(activeId);
    const overTaskInfo = findTaskAndColumn(overId);
    const overIsColumn = overId.startsWith('column-');
    const targetColumnId = overIsColumn
      ? overId.replace('column-', '')
      : overTaskInfo?.columnId;

    if (!activeTaskInfo || !targetColumnId) return;

    const fromColumnId = activeTaskInfo.columnId;
    const taskData = activeTaskInfo.task;

    const statusMap = {
      todo: 'To Do',
      inProgress: 'In Progress',
      done: 'Done',
    };

    if (fromColumnId === targetColumnId) {
      // Same column movement
      const oldIndex = columns[fromColumnId].findIndex(
        (t) => t._id === activeId // Changed to use _id
      );
      const newIndex = overIsColumn
        ? 0
        : columns[targetColumnId].findIndex((t) => t._id === overId); // Changed to use _id

      setColumns((prev) => ({
        ...prev,
        [targetColumnId]: arrayMove(prev[targetColumnId], oldIndex, newIndex),
      }));
    } else {
      // Moving between columns
      const newStatus = statusMap[targetColumnId];

      const newColumns = {
        ...columns,
        [fromColumnId]: columns[fromColumnId].filter((t) => t._id !== activeId), // Changed to use _id
        [targetColumnId]: [
          ...columns[targetColumnId].slice(
            0,
            overIsColumn
              ? 0
              : columns[targetColumnId].findIndex((t) => t._id === overId) // Changed to use _id
          ),
          {
            ...taskData,
            status: newStatus,
            position: overIsColumn
              ? 0
              : columns[targetColumnId].findIndex((t) => t._id === overId), // Update position
          },
          ...columns[targetColumnId].slice(
            overIsColumn
              ? 0
              : columns[targetColumnId].findIndex((t) => t._id === overId) // Changed to use _id
          ),
        ],
      };

      setColumns(newColumns);

      try {
        const updatedTaskData = {
          title: taskData.title,
          description: taskData.description,
          taskColor: taskData.taskColor || 'red',
          dueDate: taskData.dueDate || null,
          status: newStatus,
          priority: taskData.priority || 'Medium',
          position: overIsColumn
            ? 0
            : columns[targetColumnId].findIndex((t) => t._id === overId),
          vendor: taskData.vendor,
        };

        await axios.put(
          `http://localhost:4000/api/task/update-task/${activeId}`, // Make sure your API expects _id
          updatedTaskData,
          { withCredentials: true }
        );

        // update the context side
        setTasksPerBoard((prev) => {
          const newTasks = prev.tasks.map((task) =>
            task._id === activeId ? { ...task, ...updatedTaskData } : task
          );
          return { ...prev, tasks: newTasks };
        });
      } catch (error) {
        // Revert on error
        setColumns((prev) => ({
          ...prev,
          [fromColumnId]: [
            ...prev[fromColumnId],
            { ...taskData, status: statusMap[fromColumnId] },
          ],
          [targetColumnId]: prev[targetColumnId].filter(
            (t) => t._id !== activeId // Changed to use _id
          ),
        }));
        alert(
          'Failed to update task status: ' +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          {Object.keys(columns).map((columnId) => (
            <SortableContext
              key={columnId}
              items={columns[columnId].map((task) => task._id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                id={columnId}
                tasks={columns[columnId]}
                onTaskClick={(task) => setSelectedTask(task)}
              />
            </SortableContext>
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="w-72">
              <TaskCard task={activeTask} id={activeTask.id} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={handleUpdateTask}
          onTaskDelete={handleDeleteTask}
        />
      )}
    </>
  );
};

export default KanbanBoard;
