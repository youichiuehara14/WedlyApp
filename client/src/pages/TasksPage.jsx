import { useContext, useEffect } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import TaskFormButton from '../components/TaskFormButton';
import { Context } from '../Context';

function TasksPage() {
  const {
    user,
    activeBoardObject,
    fetchTasksPerBoard,
    tasksPerBoard,
    setTasksPerBoard,
  } = useContext(Context);
  // Fetch tasks only once on component mount
  useEffect(() => {
    if (activeBoardObject) {
      fetchTasksPerBoard(activeBoardObject._id);
    }
  }, []);

  if (!user) {
    return <div>Loading user data...</div>;
  }

  const addNewTaskOnBoard = async () => {
    setTasksPerBoard((prevTasks) => ({
      ...prevTasks,
      tasks: [...prevTasks.tasks, {}],
    }));
    // Fetch tasks again to ensure the latest data is displayed
    await fetchTasksPerBoard(activeBoardObject._id);
  };

  return (
    <>
      {activeBoardObject ? (
        <>
          <div className="space-y-15">
            <TaskFormButton onTaskCreated={addNewTaskOnBoard} />
            <KanbanBoard />
          </div>
        </>
      ) : (
        // If no active board is selected, show a message
        <div className="text-gray-500 text-sm">
          Please select a board to view tasks.
        </div>
      )}
    </>
  );
}

export default TasksPage;
