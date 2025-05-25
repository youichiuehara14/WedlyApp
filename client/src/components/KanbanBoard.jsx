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
import { Context } from '../Context';
import TaskFormButton from './TaskFormButton';
import BASE_URL from '../config.js';

const KanbanBoard = () => {
  const { fetchTasksPerBoard, activeBoardObject, tasksPerBoard, setTasksPerBoard } =
    useContext(Context);
  const [columns, setColumns] = useState({
    todo: [],
    inProgress: [],
    done: [],
  });
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (activeBoardObject) {
      fetchTasksPerBoard(activeBoardObject._id);
    }
  }, []);

  const addNewTaskOnBoard = async () => {
    setTasksPerBoard((prevTasks) => ({
      ...prevTasks,
      tasks: [...prevTasks.tasks, {}],
    }));
    await fetchTasksPerBoard(activeBoardObject._id);
  };

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
        vendor: task.vendor?._id?.toString() || null,
        vendorName: task.vendor?.name || '',
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
  }, [tasksPerBoard]);

  const handleUpdateTask = (updatedTask) => {
    setColumns((prev) => {
      const newColumns = { ...prev };
      for (const columnId in prev) {
        newColumns[columnId] = prev[columnId].filter((task) => task._id !== updatedTask._id);
      }
      if (updatedTask.status === 'To Do') {
        newColumns.todo = [...newColumns.todo, updatedTask];
      } else if (updatedTask.status === 'In Progress') {
        newColumns.inProgress = [...newColumns.inProgress, updatedTask];
      } else if (updatedTask.status === 'Done') {
        newColumns.done = [...newColumns.done, updatedTask];
      }
      return newColumns;
    });

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
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const findTaskAndColumn = (id) => {
    for (const [columnId, tasks] of Object.entries(columns)) {
      const task = tasks.find((t) => t._id === id || `${columnId}-${t._id}` === id);
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
      const oldIndex = columns[fromColumnId].findIndex((t) => t._id === activeId);
      const newIndex = overIsColumn
        ? 0
        : columns[targetColumnId].findIndex((t) => t._id === overId);

      setColumns((prev) => ({
        ...prev,
        [targetColumnId]: arrayMove(prev[targetColumnId], oldIndex, newIndex),
      }));
    } else {
      const newStatus = statusMap[targetColumnId];

      const newColumns = {
        ...columns,
        [fromColumnId]: columns[fromColumnId].filter((t) => t._id !== activeId),
        [targetColumnId]: [
          ...columns[targetColumnId].slice(
            0,
            overIsColumn ? 0 : columns[targetColumnId].findIndex((t) => t._id === overId)
          ),
          {
            ...taskData,
            status: newStatus,
            position: overIsColumn ? 0 : columns[targetColumnId].findIndex((t) => t._id === overId),
          },
          ...columns[targetColumnId].slice(
            overIsColumn ? 0 : columns[targetColumnId].findIndex((t) => t._id === overId)
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
          position: overIsColumn ? 0 : columns[targetColumnId].findIndex((t) => t._id === overId),
          ...(taskData.vendor && { vendor: taskData.vendor }),
        };

        await axios.put(`${BASE_URL}/api/task/update-task/${activeId}`, updatedTaskData, {
          withCredentials: true,
        });

        setTasksPerBoard((prev) => {
          const newTasks = prev.tasks.map((task) =>
            task._id === activeId ? { ...task, ...updatedTaskData } : task
          );
          return { ...prev, tasks: newTasks };
        });
      } catch (error) {
        setColumns((prev) => ({
          ...prev,
          [fromColumnId]: [...prev[fromColumnId], { ...taskData, status: statusMap[fromColumnId] }],
          [targetColumnId]: prev[targetColumnId].filter((t) => t._id !== activeId),
        }));
        alert('Failed to update task status: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full justify-evenly items-center overflow-x-auto rounded-4xl border-[#dddddd2d]">
      <div className="flex flex-col w-[90%] mx-auto gap-4 sm:gap-6 mt-15 mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl text-black font-semibold">
          Board: {activeBoardObject.name}
        </h1>
        <div className="flex gap-4 text-black font-semibold text-xs sm:text-sm md:text-base">
          <span>{columns.todo.length} To Do</span>
          <span>{columns.inProgress.length} In Progress</span>
          <span>{columns.done.length} Done</span>
        </div>
        <TaskFormButton onTaskCreated={addNewTaskOnBoard} />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-row px-10 space-x-5 space-y-3 sm:space-y-0 lg:space-x-10 max-w-full">
          {Object.keys(columns).map((columnId) => (
            <SortableContext
              key={columnId}
              items={columns[columnId].map((task) => task._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="w-full sm:w-64 md:w-72 lg:w-80 flex-shrink-0">
                <KanbanColumn
                  id={columnId}
                  tasks={columns[columnId]}
                  onTaskClick={(task) => setSelectedTask(task)}
                />
              </div>
            </SortableContext>
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="w-full max-w-64 sm:max-w-72 md:max-w-80">
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
    </div>
  );
};

export default KanbanBoard;
