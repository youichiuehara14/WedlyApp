import { useContext } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import TaskFormButton from '../components/TaskFormButton';
import { Context } from '../Context';

function TasksPage() {
  const { user } = useContext(Context);

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="space-y-15">
      <TaskFormButton />
      <KanbanBoard />
    </div>
  );
}

export default TasksPage;
