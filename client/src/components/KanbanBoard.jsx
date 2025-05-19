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
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import TaskModal from './modals/TaskModal';
import { BoardContext } from '../BoardContext';

const KanbanBoard = () => {
  const { boardId } = useContext(BoardContext);
  const [columns, setColumns] = useState({ todo: [], inProgress: [], done: [] });
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!boardId) return; // Skip fetching if boardId is not set
      try {
        const response = await axios.get(`http://localhost:4000/api/task/board/${boardId}`, {
          withCredentials: true,
        });
        const { tasks } = response.data;

        const grouped = { todo: [], inProgress: [], done: [] };
        tasks.forEach((task) => {
          const formattedTask = {
            id: task._id,
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
          else if (task.status === 'In Progress') grouped.inProgress.push(formattedTask);
          else if (task.status === 'Done') grouped.done.push(formattedTask);
        });

        setColumns(grouped);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };

    fetchTasks();
  }, [boardId]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  const findTaskAndColumn = (id) => {
    for (const [columnId, tasks] of Object.entries(columns)) {
      const task = tasks.find((t) => t.id === id);
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

    const activeTaskInfo = findTaskAndColumn(activeId);
    const overTaskInfo = findTaskAndColumn(overId);
    const overIsColumn = overId.startsWith('column-');
    const targetColumnId = overIsColumn ? overId.replace('column-', '') : overTaskInfo?.columnId;

    if (!activeTaskInfo || !targetColumnId) return;

    const fromColumnId = activeTaskInfo.columnId;
    const taskData = activeTaskInfo.task;

    const statusMap = {
      todo: 'To Do',
      inProgress: 'In Progress',
      done: 'Done',
    };

    if (fromColumnId === targetColumnId) {
      const oldIndex = columns[fromColumnId].findIndex((t) => t.id === activeId);
      const newIndex = overIsColumn ? 0 : columns[targetColumnId].findIndex((t) => t.id === overId);
      setColumns((prev) => ({
        ...prev,
        [targetColumnId]: arrayMove(prev[targetColumnId], oldIndex, newIndex),
      }));
    } else {
      const newStatus = statusMap[targetColumnId];

      if (!taskData.vendor || !taskData.vendor.match(/^[0-9a-fA-F]{24}$/)) {
        alert('Invalid vendor ID. Please update the vendor in the database.');
        return;
      }

      if (!taskData.title || !taskData.description) {
        alert('Missing title or description.');
        return;
      }

      const newColumns = {
        ...columns,
        [fromColumnId]: columns[fromColumnId].filter((t) => t.id !== activeId),
        [targetColumnId]: [
          ...columns[targetColumnId].slice(
            0,
            overIsColumn ? 0 : columns[targetColumnId].findIndex((t) => t.id === overId)
          ),
          { ...taskData, status: newStatus },
          ...columns[targetColumnId].slice(
            overIsColumn ? 0 : columns[targetColumnId].findIndex((t) => t.id === overId)
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
          position: taskData.position || 0,
          vendor: taskData.vendor,
        };

        await axios.put(`http://localhost:4000/api/task/update-task/${activeId}`, updatedTaskData, {
          withCredentials: true,
        });
      } catch (error) {
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
      <h1>Current Board Id: {boardId}</h1>
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
              items={columns[columnId].map((task) => task.id)}
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
      {selectedTask && <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </>
  );
};

export default KanbanBoard;
