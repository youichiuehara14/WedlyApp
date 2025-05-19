// import KanbanBoard from '../components/KanbanBoard';
import { useContext, useState, useEffect } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import TaskFormButton from '../components/TaskFormButton';
import { Context } from '../Context';

function TasksPage() {
  const { user } = useContext(Context);
  const [selectedBoardId, setSelectedselectedBoardId] = useState(user?.boards?.[0]?._id);

  const handleBoardChange = (e) => {
    setSelectedselectedBoardId(e.target.value);
  };

  useEffect(() => {
    console.log(selectedBoardId);
  }, [selectedBoardId]);

  // const selectedBoard = user?.boards?.find((board) => board._id === selectedBoardId);

  return (
    <div className="space-y-15">
      <select
        onChange={handleBoardChange}
        value={selectedBoardId}
        className="border-1 border-gray-300 p-1 font-semibold"
      >
        {user.boards.map((board) => (
          <option key={board._id} value={board._id}>
            {board.name}
          </option>
        ))}
      </select>
      <TaskFormButton />
      <KanbanBoard boardId={selectedBoardId} />
      {/* <KanbanBoard /> */}
    </div>
  );
}

export default TasksPage;
