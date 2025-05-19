import { useContext } from 'react';
import { BoardContext } from '../BoardContext';
import { Context } from '../Context';

function BoardSelect() {
  const { boardId, setBoardId } = useContext(BoardContext);
  const { user } = useContext(Context);

  const handleBoardChange = (e) => {
    setBoardId(e.target.value);
  };

  // If no boards or user is not loaded, show a placeholder
  if (!user?.boards?.length) {
    return <div>No boards available</div>;
  }

  return (
    <div>
      <select
        onChange={handleBoardChange}
        value={boardId || ''}
        className="border-1 border-gray-500 px-2 py-1"
      >
        <option value="" disabled>
          Select a board
        </option>
        {user.boards.map((board) => (
          <option key={board._id} value={board._id}>
            {board.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default BoardSelect;
