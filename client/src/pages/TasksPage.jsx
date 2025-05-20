import { useContext } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import TaskFormButton from '../components/TaskFormButton';
import { Context } from '../Context';

function TasksPage() {
  const { user, activeBoardObject, fetchTasksPerBoard } = useContext(Context);

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <>
      {activeBoardObject ? (
        <>
          <div className="space-y-15">
            <TaskFormButton onTaskCreated={fetchTasksPerBoard} />
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
